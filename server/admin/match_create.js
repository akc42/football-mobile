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

  const debug = require('debug')('football:api:matchcreate');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid, ',rid', params.rid, ',aid', params.aid  );
    //use dummy time of now so we can order them.
    const creatematch = db.prepare(`INSERT INTO match (cid, rid, aid ,hid, match_time) VALUES (?,?, ?, null, strftime('%s','now'))`);
    const invalidateCompetitionCache = db.prepare('UPDATE competition SET results_cache = NULL WHERE cid = ?');
    const invalidateRoundCache = db.prepare('UPDATE round SET results_cache = NULL WHERE cid = ? AND rid = ?');
    const matches = db.prepare('SELECT * FROM match WHERE cid = ? AND rid = ? ORDER BY match_time DESC');
    db.transaction(() => {
      creatematch.run(cid, params.rid, params.aid);
      invalidateCompetitionCache.run(cid)
      invalidateRoundCache.run(cid, params.rid);
      responder.addSection('matches', matches.all(cid, params.rid));
    })();
    debug('request complete')    
  };
})();