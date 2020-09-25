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

  const debug = require('debug')('football:api:gadmpromote');
  const db = require('../utils/database');

  module.exports = async function(user,  params, responder) {
    debug('new request from user', user.uid);
    const updateGlobalAdmin = db.prepare('UPDATE participant SET global_admin = 1 WHERE uid = ?');
    const updateMemberApprove = db.prepare('UPDAte participant SET member_approve = ? WHERE uid = ?');
    const updateUnlikely = db.prepare('UPDATE participant SET unlikely = ? WHERE uid = ?');
    //Note: 3 years is approx 94608000 seconds.
    const users = db.prepare(`SELECT uid, name, email, global_admin, member_approve, 
      IFNULL((SELECT cid FROM competition WHERE administrator = participant.uid AND 
        update_date > ((strftime('%s','now')) - 94608000) ORDER BY cid DESC LIMIT 1),0) as previous_admin,
      IFNULL((SELECT cid FROM registration WHERE uid = participant.uid ORDER BY cid DESC LIMIT 1),0) as cid, last_logon, unlikely FROM participant 
      WHERE waiting_approval = 0 ORDER BY unlikely ASC, previous_admin DESC, global_admin DESC, member_approve DESC, cid DESC, last_logon DESC`);
    debug('prepared ')
    db.transaction(() => {
      for (const uid of params.ga) updateGlobalAdmin.run(uid);
      for (const uid of params.map) updateMemberApprove.run(1,uid);
      for (const uid of params.mad) updateMemberApprove.run(0, uid);
      for (const uid of params.unp) updateUnlikely.run(1,uid);
      for (const uid of params.und) updateUnlikely.run(0, uid);
      responder.addSection('users', users.all());
    })();
  };
})();