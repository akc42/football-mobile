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

  const debug = require('debug')('football:api:newmemberemailverify');
  const Mailer  = require('../utils/mail');
  const mailPromise = Mailer();
  const bcrypt = require('bcrypt');
  const jwt = require('jwt-simple');
  const db = require('../utils/database');

  module.exports = async function(params,headers) {
    debug('got new request');
    const mail = await mailPromise;

    debug('going to make a hashed version of the incoming password');
    const hashedPassword = await bcrypt.hash(params.password, 10);
    /* 
      So the next step it to prepare the queries that check rate limits
    */
    const checkParticipant = db.prepare('SELECT COUNT(*) FROM participant WHERE email = ?').pluck(); 
    const s = db.prepare('SELECT value FROM settings WHERE name = ?').pluck();
    const recentRequestCount = db.prepare('SELECT COUNT(*) FROM membership_request WHERE (email = ? OR sid = ?) AND request_time > ?').pluck();
    const newRequest = db.prepare('INSERT INTO membership_request (sid, email, ipaddress) VALUES (?,?,?)');
// SEE BELOW    const purge = db.prepare('DELETE FROM membership_request WHERE request_time < ?');
    const now = Math.floor(new Date().getTime()/1000);
    const dMonthAgo = new Date();
    dMonthAgo.setMonth(dMonthAgo.getMonth() - 1);
    const aMonthAgo = Math.floor(dMonthAgo.getTime()/1000);
    let returnValue = 'pin'; //lets assume we will succeed
    db.transaction(()=>{
/*
  I have decided to exclude this for now.  I might want to investigate old attacks or something like that, and this table
  will have important information that doesn't want to get lost.  NOTE: I should only re-instate if practice shows that we
  get so many entries that the database is growing two large.  Even then manually doing it might be a better approach.

      //take the first opportunity (in case other checks fail) of purging older requests.
      purge.run(aMonthAgo - 2592000); //a month ago and 30 days before that
*/
      const result = checkParticipant.get(params.email);

      if (result === 0) {
        //as expected we are not yet in the participant list (which is good)
        const membershipKey = s.get('membership_key');
        try { 
          debug('see of we can unlock sid and get its data')
          const payload = jwt.decode(params.sid, membershipKey);
          const sid = payload.sid;
          const ip = payload.ip;
          debug('payload.sid = ', sid);
          if (/^\d+$/.test(sid)) {
            debug('lets find out if we have been doing any recent requests');
            const membershipRate = s.get('membership_rate');
            const nearLimit = now - (60 * membershipRate);
            const recentCount = recentRequestCount.get(params.email, sid,nearLimit);
            debug('recent count = ', recentCount);
            if (recentCount === 0) {
              const maxMembership = s.get('max_membership');
              const monthlyCount = recentRequestCount.get(params.email, sid, aMonthAgo);
              debug('monthly count', monthlyCount);
              if (monthlyCount <= maxMembership) {
                //so we haven it any limits so lets record this one
                newRequest.run(sid, params.email, ip);
                debug('created the request entry, so now build and send email');
                const siteBaseref = 'https://' + headers['host']; //not from database
                const webmaster = s.get('webmaster');
                const verifyExpires = s.get('verify_expires');
                const cookieKey = s.get('cookie_key');
                //not doing this too fast since last time
                const payload = {
                  exp: new Date().setTime(now + (verifyExpires * 60 * 60)),
                  email: params.email,
                  password: hashedPassword,
                }
                const token = jwt.encode(payload, cookieKey);
                debug('made token', token);
                const html = `<h3>Email Verification</h3><p>Someone using your e-mail address has asked to become a member
                at <a href="${siteBaseref}">${siteBaseref}</a>. The first step of the process is to verify that e-mail address, and that is what
                this mail is for. If it was not you, you can safely ignore this email but might like to inform 
                <a href="mailto:${webmaster}">${webmaster}</a> that you were not expecting it.</p>
                <p>Click on the link <a href="${siteBaseref}/api/pin/${token}">${siteBaseref}/api/pin/${token}</a> confirm that
                you requested membership and to move on to second step of the process.</p>
                <p>This link will only work <strong>once</strong>, and it will <strong>not</strong> work after <strong>${verifyExpires} hours</strong> from
                the time you requested it.</p>
                <p>Regards</p>`;
                mail.setHtmlBody(siteBaseref, 'Membership Verification', html);
              } else {
                returnValue = 'toomany';
              }
            } else {
              returnValue = 'toomany';
            }
          } else {
            returnValue = 'toomany'
          }
        } catch(e) {
          debug('sid likely corrupted');
          //corrupted sid = means someone tamperered with it.  Go to this error page
          returnValue = 'toomany';
        }
      } else {
        returnValue = 'email';  //just get out of here and go back to an e-mail login. 
      } 
    })();
    //outside of the transaction, which needs to remain synchronous.
    if (returnValue === 'pin') await mail.send('Membership Verification', params.email);
    return {state: returnValue};
  };
})();