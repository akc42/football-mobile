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

  const debug = require('debug')('football:api:gadmdata');
  const db = require('../utils/database');

  module.exports = async function(user,  params, responder) {
    debug('new request from user', user.uid);
    const comp = db.prepare(`SELECT c.cid, c.name, c.administrator, c.open, c.closed FROM competition c 
      WHERE NOT EXISTS (SELECT cid FROM registration WHERE cid = c.cid) OR c.administrator = 0 
	    ORDER BY c.cid;`);
    const users = db.prepare(`SELECT uid, name, email, global_admin, member_approve, (
      SELECT cid FROM registration WHERE uid = participant.uid ORDER BY cid DESC LIMIT 1
    ) as cid, last_logon FROM participant ORDER BY global_admin DESC, member_approve DESC, cid DESC, last_logon DESC;`);
    debug('prepared ')
    db.transaction(() => {
      responder.addSection('competitions', comp.all());
      responder.addSection('users', users.all());
    })();
  };
})();