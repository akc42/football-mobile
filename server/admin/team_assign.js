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

  const debug = require('debug')('football:api:teamassign');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid );
    const addcid = db.prepare('INSERT INTO team_in_competition (cid, tid, points) VALUES (?,?,?)');
    const removecid = db.prepare('DELETE FROM team_in_competition WHERE cid = ?, tid = ?');
    db.transaction(() => {
      if (params.assign) {
        addcid.run(cid, params.tid, params.points);
      } else {
        removecid.run(cid, params.tid);
      }
      responder.addSection('tid', params.tid);
      responder.addSection('assign', params.assign);
    })();
    
  };
})();