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

  const debug = require('debug')('football:api:verify');
  const Mailer  = require('../utils/mail');
  const mailPromise = Mailer();
  const bcrypt = require('bcrypt');
  const jwt = require('jwt-simple');
  const dbOpen = require('../utils/database');

  module.exports = async function(headers, params) {
    const db = await dbOpen();
    await db.exec('BEGIN TRANSACTION');
    const result = await db.get(
      'SELECT * FROM participant WHERE email = ? ;',
      params.email
    );
    if (result !== undefined) {
      let pin;
      const user = { ...result, password: !!result.password, verification_key: !!result.verification_key }
      pin = ('000000' + (Math.floor(Math.random() * 999999)).toString()).slice(-6); //make a new pin 
      user.verification_key = await new Promise((accept, reject) => {
        bcrypt.hash(pin, 10, (err, result) => {
          if (err) { reject(err); } else accept(result);
        });
      });
      const s = await db.prepare('SELECT value FROM settings WHERE name = ?');
      const { value: cookieKey } = await s.get('cookie_key');
      const { value: webmaster } = await s.get('webmaster');
      const { value: verifyExpires } = await s.get('verify_expires');
      const { value: siteBaseref } = await s.get('site_baseref');
      const { value: rateLimit } = await s.get('rate_limit');
      await s.finalize();
      const now = new Date();
      //silently do nothing if rateLimit is exceeded
      if ((user.verifcation_sent + rateLimit) < (now.getTime()/1000)) {
        //not doing this too fast since last time
        const payload = {
          exp: new Date().setTime(now.getTime() + (verifyExpires * 60 * 60 * 1000 )),
          user: user.uid,
          pin: pin,
          usage: 'profile'
        }
        debug('found user', user.uid,'so about to send pin', pin, 'with expiry in', verifyExpires,'hours');
        const token = jwt.encode(payload, cookieKey);
        debug('made token', token);
        const html = `<h3>Hi ${user.name}</h3><p>Someone requested a short term password to log on to <a href="${siteBaseref}">${siteBaseref}</a>. They
        requestd for it to be sent to this email address. If it was not you, you can safely ignore this email but might like to inform 
        <a href="mailto:${webmaster}">${webmaster}</a> that you were not expecting it.</p>
        <p>Click on the link <a href="${siteBaseref}/api/reg/pin/${token}">${siteBaseref}/api/reg/pin/${token}</a> to log on
        and access your profile. There you may reset your passwords or make other changes to your account.</p>
        <p>This link will only work <strong>once</strong>, nor will it work after <strong>${verifyExpires} hours</strong> from
        the time you requested it.</p>
        <p>Regards</p>`;
        const mail = await mailPromise;
        mail.setHtmlBody('Temporary Password', html);
        debug('set body about to try and send email');
        await mail.send('Your temporary password', user.email);
        debug('email send, now update database with verification key');
        await db.exec('UPDATE participant SET verification_key = ?, verification_sent = CURRENT_TIMESTAMP WHERE uid = ?', user.verification_key, user.uid);
      } else {
        debug('rate limit exceeded, so we silently don\'t send another email, but do update the database');
        await db.exec('UPDATE participant SET verification_sent = CURRENT_TIMESTAMP WHERE uid = ?', user.uid);
      }  
    
      await db.exec('COMMIT');
      await db.close();
      debug('success');
      return {found: true, password: user.password};
    }
    await db.close();
    debug('record not found');
    return {found: false};
  };
})();