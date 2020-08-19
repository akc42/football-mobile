/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file is part of Football Mobile.

    Football Mobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Football Mobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Football Mobile.  If not, see <http://www.gnu.org/licenses/>.
*/

(function() {
  'use strict';

  const debug = require('debug')('football:api:reqpin');
  const Mailer  = require('../utils/mail');
  const mailPromise = Mailer();
  const bcrypt = require('bcrypt');
  const jwt = require('jwt-simple');
  const db = require('../utils/database');

  module.exports = async function(params) {
    debug('request received for uid', params.uid);
    const mail = await mailPromise;
    const pin = ('000000' + (Math.floor(Math.random() * 999999)).toString()).slice(-6); //make a new pin 
    debug('going to use pin', pin);
    const hashedPin = await bcrypt.hash(pin, 10);
    debug('have a hashed pin now');
    let rateLimitExceeded = true;  //start that way until proved otherwise, so we don't send mail if user not found
    const checkParticipant = db.prepare('SELECT * FROM participant WHERE uid = ?');
    const s = db.prepare('SELECT value FROM settings WHERE name = ?').pluck();
    let email;
    const updateParticipant = db.prepare(`UPDATE participant SET verification_key = ?, verification_sent = (strftime('%s','now')) WHERE uid = ?`);
    db.transaction(() => {
      debug('in transaction about to check participant with uid', params.uid);
      const result = checkParticipant.get(params.uid);
      if (result !== undefined) {
        debug('found user from uid as email = ', result.email);
        const cookieKey = s.get('cookie_key');
        const webmaster = s.get('webmaster');
        const verifyExpires = s.get('verify_expires');
        const siteBaseref = s.get('site_baseref');
        const rateLimit = s.get('rate_limit');
        debug('read the config values');
        const now = Math.floor((new Date().getTime() / 1000));
        rateLimitExceeded = (!!result.verification_key && (result.verification_sent + (rateLimit * 60)) > now);
        debug(
          'verification_sent rate end @ ', result.verification_sent + (rateLimit * 60),
          'rate limit = ', rateLimit,
          'now is', now,
          'verification_key', !!result.verification_key,
          'exceeded', rateLimitExceeded);

        if (!rateLimitExceeded) {
          //not doing this too fast since last time
          const payload = {
            exp: new Date().setTime(now + (verifyExpires * 60 * 60)),
            uid: result.uid,
            pin: pin,
            usage: result.waiting_approval === 1 ? '/':'/profile'
          }
          debug('with user', result.uid, 'so about to send pin', pin, 'with expiry in', verifyExpires, 'hours');
          const token = jwt.encode(payload, cookieKey);
          debug('made token', token);
          const html = `<h3>Hi ${result.name}</h3><p>Someone requested a short term password to log on to <a href="${siteBaseref}">${siteBaseref}</a>. They
          requested for it to be sent to this email address. If it was not you, you can safely ignore this email but might like to inform 
          <a href="mailto:${webmaster}">${webmaster}</a> that you were not expecting it.</p>
          <p>Click on the link <a href="${siteBaseref}/api/pin/${token}">${siteBaseref}/api/pin/${token}</a> to log on
          and access your profile. There you may reset your passwords or make other changes to your account.</p>
          <p>This link will only work <strong>once</strong>, and it will <strong>not</strong> work after <strong>${verifyExpires} hours</strong> from
          the time you requested it.</p>
          <p>Regards</p>`;        
          mail.setHtmlBody('Temporary Password', html);
          debug('built the e-mail');
          updateParticipant.run(hashedPin, result.uid); //update user with new hashed pin we just sent
          debug('upated user ', result.uid, 'with new pin we just made')
          email = result.email;
        } else {
          //silently do nothing if rateLimit is exceeded
          debug('rate limit exceeded to silently update user')
          updateParticipant.run(result.verification_key, result.uid); //change the time, but just update with the same key as we already had
        }
       
      }
    })();
    //outside of the transaction, so can now be asynchonous again.

    if (!rateLimitExceeded ) await mail.send('Your Temporary Password', email);
    debug('All done');
    return !rateLimitExceeded;
  };
})();