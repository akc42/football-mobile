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

  const debug = require('debug')('football:api:memberemail');
  const Mailer  = require('../utils/mail');
  const mailPromise = Mailer();
  const bcrypt = require('bcrypt');
  const jwt = require('jwt-simple');
  const dbOpen = require('../utils/database');

  module.exports = async function(params) {
    const db = await dbOpen();
    await db.exec('BEGIN TRANSACTION');
    debug('see if we already have user in database with email', params.email);
    const result = await db.get(
      'SELECT * FROM participant WHERE email = ? ;',
      params.email
    );
    if (result === undefined || (result.waiting_approval !== 0 && !result.reason)) {
      debug('no participant, or one being approved - result ', result !== undefined);
      const s = await db.prepare('SELECT value FROM settings WHERE name = ?');
      const { value: cookieKey } = await s.get('cookie_key');
      const { value: webmaster } = await s.get('webmaster');
      const { value: verifyExpires } = await s.get('verify_expires');
      const { value: siteBaseref } = await s.get('site_baseref');
      const { value: rateLimit } = await s.get('rate_limit');
      await s.finalize();
      let pin;
      let user;
      const now = Math.floor((new Date().getTime() / 1000));

      if (result === undefined) {
        debug('about to create a new participant')
        const {lastID} = await db.run('INSERT INTO Participant (email,waiting_approval,reason) VALUES( ? ,true,NULL);', params.email);
        debug('participant id = ', lastID);
        user = {
          uid: lastID, password: false, name: '', last_logon: now, email: params.email,
          global_admin: 0, unlikely: 0, verification_sent: now - (rateLimit * 61), waiting_approval: 1, reason: null, remember: 0
        };
      } else {
        user = { ...result, password: !!result.password, verification_key: !!result.verification_key};
        debug('found user as uid = ', user.uid);
      }
      pin = ('000000' + (Math.floor(Math.random() * 999999)).toString()).slice(-6); //make a new pin 
      debug('going to use pin', pin);
      user.verification_key = await new Promise((accept, reject) => {
        bcrypt.hash(pin, 10, (err, result) => {
          if (err) { reject(err); } else accept(result);
        });
      });
      
      
      //silently do nothing if rateLimit is exceeded
      debug(
        'verification_sent rate end @ ', user.verification_sent + (rateLimit * 60),
        ' rate limit = ', rateLimit,
        ' now is ', now );
      if ((user.verification_sent + (rateLimit * 60)) < now) {
        //not doing this too fast since last time
        const payload = {
          exp: new Date().setTime(now + (verifyExpires * 60 * 60)),
          user: user.uid,
          pin: pin,
          usage: 'memberapprove'
        }
        debug('with user', user.uid,'so about to send pin', pin, 'with expiry in', verifyExpires,'hours');
        const token = jwt.encode(payload, cookieKey);
        debug('made token', token);
        const html = `<h3>Email Verification</h3><p>Someone using your e-mail address has asked to become a member
        at <a href="${siteBaseref}">${siteBaseref}</a>. The first step of the process is to verify that e-mail address, and that is what
        this mail is for. If it was not you, you can safely ignore this email but might like to inform 
        <a href="mailto:${webmaster}">${webmaster}</a> that you were not expecting it.</p>
        <p>Click on the link <a href="${siteBaseref}/api/pin/${token}">${siteBaseref}/api/reg/pin/${token}</a> confirm that
        you requested membership and to move on to second step of the process.</p>
        <p>This link will only work <strong>once</strong>, and it will <strong>not</strong> work after <strong>${verifyExpires} hours</strong> from
        the time you requested it.</p>
        <p>Regards</p>`;
        const mail = await mailPromise;
        mail.setHtmlBody('Membership Verification', html);
        debug('set body about to try and send email');
        await mail.send('Membership Verification', user.email);
        debug('email send, now update database with verification_key', user.verification_key, 'and uid', user.uid);
        await db.run(`UPDATE participant SET verification_key = ? , verification_sent = ? WHERE uid = ?`, user.verification_key, now, user.uid);
      } else {
        debug('rate limit exceeded, so we silently don\'t send another email, but do update the database');
        await db.run(`UPDATE participant SET verification_sent = (strftime('%s','now')) WHERE uid = ?`, user.uid);
      }  
    
      await db.exec('COMMIT');
      await db.close();
      debug('success');
      return {known:false};
    }
    await db.close();
    debug('record not found');
    return {known: true};
  };
})();