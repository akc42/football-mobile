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


  const debug = require('debug')('football:api:emailchange');
  const Mailer  = require('../utils/mail');
  const mailPromise = Mailer();
  const bcrypt = require('bcrypt');
  const jwt = require('jwt-simple');
  const db = require('../utils/database');

  module.exports = async function(params) {
    const mail = await mailPromise;
    debug('send a pin to allow user',params.uid,'to change their e-mail to',params.email);
    const pin = ('000000' + (Math.floor(Math.random() * 999999)).toString()).slice(-6); //make a new pin 
    debug('going to use pin', pin);
    let rateLimitExceeded = false;
    let needEmail = false;
    let hasPassword = false;
    let hasVerificationKey = false;
    let returnValue = { found: false };
    let user;
    const sqlParams = [params.name, params.remember? 1:0];
    let sql = 'UPDATE participant SET name = ? , remember = ?';

    let hashedPin;
    if (params.password.length > 0) {
      const hashedPassword = await bcrypt.hash(params.password, 10);
      sql += ', password = ?'
      sqlParams.push(hashedPassword);
      hasPassword = true;
    }   
    if (params.email && params.email.length > 0) {
      hashedPin = await bcrypt.hash(pin, 10);
      debug('have a hashed pin now');
    }
    const checkParticipant = db.prepare('SELECT * FROM participant WHERE uid = ?');
    const s = db.prepare('SELECT value FROM settings WHERE name = ?').pluck();

    db.transaction(() => {
      debug('in transaction about to check participant with uid', params.uid);
      const result = checkParticipant.get(params.uid);
      if (result === undefined) throw new Error('Invalid Participant uid ' + params.uid);
      user = { ...result, password: !!result.password || hasPassword, verification_key: !!result.verification_key, 
        name: params.name, remember: params.remember? 1 : 0 };
      debug('found user', result.uid);
      if (params.email && params.email !== email) {
        sql += `, verification_sent = (strftime(' % s','now'))`; //we are changing e-mail, so going at least mark a verification sent time
        const cookieKey = s.get('cookie_key');
        const webmaster = s.get('webmaster');
        const verifyExpires = s.get('verify_expires');
        const siteBaseref = s.get('site_baseref');
        const rateLimit = s.get('rate_limit');
        debug('read the config values');
        const now = Math.floor((new Date().getTime() / 1000));
        
        rateLimitExceeded = (user.verification_key && (user.verification_sent + (rateLimit * 60)) > now);
        debug(
          'verification_sent rate end @ ', user.verification_sent + (rateLimit * 60),
          'rate limit = ', rateLimit,
          'now is', now,
          'verification_key', user.verification_key,
          'exceeded', rateLimitExceeded);
        user.verification_key = true;
        user.verification_sent = now;
        if (!rateLimitExceeded) {
          //not doing this too fast since last time
          sql += ', verification_key = ?'
          sqlParams.push(hashedPin);
          const payload = {
            exp: new Date().setTime(now + (verifyExpires * 60 * 60)),
            user: user.uid,
            email:params.email,    //include the new e-mail so it can be unpacked
            pin: pin,
            usage: 'logon' + params.remember? 'rem':''
          }
          debug('with user', user.uid, 'so about to send pin', pin, 'with expiry in', verifyExpires, 'hours');
          const token = jwt.encode(payload, cookieKey);
          debug('made token', token);
          const html = `<h3>Hi ${user.name}</h3><p>Someone requested a change of e-mail for <a href="${siteBaseref}">${siteBaseref}</a> to this email address. If it was not you, you can safely ignore this email but might like to inform 
          <a href="mailto:${webmaster}">${webmaster}</a> that you were not expecting it.</p>
          <p>Click on the link <a href="${siteBaseref}/api/pin/${token}">${siteBaseref}/api/reg/pin/${token}</a> to confirm that change and go
          to the log on page where you should log on with this new e-mail.</p>
          <p>This link will only work <strong>once</strong>, and it will <strong>not</strong> work after <strong>${verifyExpires} hours</strong> from
          the time you changed your email in your profile.</p>
          <p>Regards</p>`;        
          mail.setHtmlBody('Change of Email', html);
          needEmail = true;
        }
      }
      sql += ' WHERE uid = ?';
      sqlParams.push(user.uid);
      db.prepare(sql).run(sqlParams);
    })();
    //outside of the transaction, which needs to remain synchronous.
    debug('finished transaction, with email needed ', needEmail);
    if (needEmail) await mail.send('Change of Email', params.email);
    const usage = params.usage === 'authorised' ? 'authorised' : params.remember? 'logonrem': 'logon';
    return {user: user, usage: usage};
  };
})();