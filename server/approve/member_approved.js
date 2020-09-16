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

  const debug = require('debug')('football:api:memberapproved');
  const Mailer  = require('../utils/mail');
  const mailPromise = Mailer();
  const db = require('../utils/database');

  module.exports = async function(user, params,headers, responder) {
    const mail = await mailPromise;
    const checkParticipant = db.prepare('SELECT email, waiting_approval FROM participant WHERE uid = ?');
    const s = db.prepare('SELECT value FROM settings WHERE name = ?').pluck();

    const updateParticipant = db.prepare(`UPDATE participant SET waiting_approval = 0 WHERE uid = ?`);
    const refreshMembers = db.prepare('SELECT * FROM participant WHERE waiting_approval = 1');
    let memberemail;
    db.transaction(()=>{
      const {email, waiting_approval} = checkParticipant.get(params.uid);
      if (waiting_approval === 1) {
        memberemail = email;
        const siteBaseref = 'https://' + headers['host']; //no longer from database, but from the request
        const webmaster = s.get('webmaster');
        const orgname = s.get('organisation_name')
        debug('read the config values');

        const html = `<h3>Good News</h3><p>Your membership request to join <a href="${siteBaseref}">${orgname}</a> has been approved.</p> 
        <p>If it was not you, you can safely ignore this email but might like to inform <a href="mailto:${webmaster}">${webmaster}</a> that 
        you were not expecting it.</p>
        <p>Click on the link above to log on.</p>
    
        <p>Regards</p>`;
        mail.setHtmlBody(siteBaseref,'Membership Approval', html);
        debug('built the e-mail');
        updateParticipant.run(params.uid); //update user as approved
        debug('upated user ', params.uid);

        responder.addSection('members', refreshMembers.all());
      } 
    })();
    //outside of the transaction, which needs to remain synchronous.
    if (memberemail !== undefined) await mail.send('Membership Approval', memberemail);
  };
})();