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

  const debug = require('debug')('football:api:matchpick');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid, 'on behalf or user', params.uid, 'for team', params.pid );
    const setPick = db.prepare(`REPLACE INTO pick (cid, uid, rid, aid,  comment, pid, over_selected, admin_made, submit_time) 
      VALUES (?,?,?,?,?,?,?, ?, strftime('%s','now'))`);
    const invalidateRoundCache = db.prepare('UPDATE round SET results_cache = NULL WHERE cid = ? and rid = ?');
    const invalidateCompetitionCache = db.prepare('UPDATE competition SET results_cache = null WHERE cid = ?');
    const getPicks = db.prepare('SELECT * FROM pick WHERE cid = ? AND uid = ? AND rid = ?');
    db.transaction(() => {
      setPick.run(cid, params.uid, params.rid, params.aid, params.comment, params.pid, params.over_selected, params.uid === user.uid? 0:1);  
      invalidateRoundCache.run(cid, params.rid);
      invalidateCompetitionCache.run(cid);
      responder.addSection('picks',getPicks.all(cid, params.uid, params.rid));
    })();
 };
})();