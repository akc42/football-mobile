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
  
    const debug = require('debug')('football:api:matchswap');
    const db = require('../utils/database');
  
    module.exports = async function(user, cid, params, responder) {
      debug('new request from user', user.uid, 'with cid', cid, ',rid', params.rid, ',aid', params.aid );
      const check = db.prepare('SELECT hid FROM match WHERE cid = ? AND rid = ? AND aid = ?').pluck();
      const mcreate = db.prepare(`INSERT INTO match (cid, rid, aid, hid, comment, ascore, hscore, combined_score, open, match_time, underdog)
      SELECT cid, rid, hid AS aid, ? AS hid, comment, hscore AS ascore, ascore AS hscore, combined_score, open, match_time, underdog
      FROM match WHERE cid ? AND rid = ? AND aid = ?`);
      const mdelete = db.prepare('DELETE FROM match WHERE cid = ? AND rid = ? AND aid = ?');
      const invalidateCompetitionCache = db.prepare('UPDATE competition SET results_cache = NULL WHERE cid = ?');
      const invalidateRoundCache = db.prepare('UPDATE round SET results_cache = NULL WHERE cid = ? AND rid = ?');
      const matches = db.prepare('SELECT * FROM match WHERE cid = ? AND rid = ? ORDER BY match_time DESC');
      db.transaction(() => {
        const hid = check.get(cid, params.rid, params.aid) 
        if (hid !== null) {
          //insert a new match with aid = old hid
          mcreate.run(params.drop !== undefined ? null : params.aid, cid, params.rid, params.aid);
          //delete original match (after insert because need data to transfer across)
          mdelete.run(cid, params.rid, params.aid);
          invalidateCompetitionCache.run(cid)
          invalidateRoundCache.run(cid, params.rid);
        }
        responder.addSection('matches', matches.all(cid, params.rid));
      })();

      
    };
  })();