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

/*
  This module is not as straight forwards as it might sound.  That is because
  instead of just returning the result of 

  SELECT u.uid, u.name FROM participant u JOIN registration r USING (uid)
  WHERE  r.cid = ? 

  we want to return the list of users according to their overall position in the
  competition.  This of course is a complex query.  So much so that the database
  has a cache of results at the competition level, and provided the cache is not
  expired by the cache_age parameter in settings we can use it.  However if its not
  set or has expired we need to rebuild it.  

  Note - the round level results_cache is a much more complex object and is not
  used in this context, but holds details of match results and picks as well as the score
  calculation.  So we will not be using it

*/

(function() {
  'use strict';

  const debug = require('debug')('football:cache:round');
  const db = require('./database');

  module.exports = function(cid,rid) {
    debug('request for cid', cid,'and rid',rid, 'prepare the query to read cache');
    // lets build some prepared queries we might need later.
    const readCache = db.prepare(`SELECT results_cache FROM round WHERE cid = ? and rid = ? AND results_cache IS NOT NULL AND cache_store_date > (
      SELECT CASE WHEN value = 0 THEN 0 ELSE strftime('%s','now') - (3600 * value) END As expiry FROM settings WHERE name = 'cache_age')`).pluck();
    debug('prepare queries to rebuild cache if we have to');
    const userScores = db.prepare(`SELECT name, u.uid AS uid, pscore, oscore, mscore, bscore, score, opid, comment, admin_made, submit_time
    FROM round_score r JOIN participant u USING (uid)
    LEFT JOIN option_pick p USING (cid,rid,uid)
    WHERE r.cid = ? AND r.rid = ? ORDER BY score DESC,u.name`);
    const matchScores = db.prepare(`SELECT aid, hid, ascore, hscore, combined_score, match_time, comment, underdog 
    FROM match WHERE cid = ? AND rid = ? AND open = 1 ORDER BY match_time, aid`);
    const matchPicks = db.prepare(`SELECT p.uid AS uid,p.aid AS aid,pid, over_selected, p.comment AS comment, pscore, oscore,admin_made,submit_time";
    $sql .= " FROM match_score m LEFT JOIN pick p USING (cid,rid,aid,uid)";
    $sql .= " WHERE m.cid = ? AND m.rid = ? `);
    const roundOptions = db.prepare(`SELECT opid, label FROM option WHERE cid = ? AND rid = ? `);
    debug('now prepare the installation query')
    const setCache = db.prepare(`UPDATE round SET results_cache = ?, cache_store_date = strftime('%s','now') WHERE cid = ? AND rid = ?`);
    debug('lets do it')
    let cache;
    db.transaction(() => {
      debug('in transaction')
      cache = readCache.get(cid,rid);
      debug('tried to read cache');
      if (!cache) {
        debug('cache not found');
        //no cache, so we are going to have to build it.
        cache = {users:[],matches:[],options:[]
          






        let lastUid = 0
        let user;
        let rounds;
        for (const row of makeCache.iterate(cid) ) {          
          if (row.uid !== lastUid) {
            if (lastUid !== 0) cache.push(user); //save the previous user before we start the next;
            lastUid = row.uid; 
            const {rid, rname, score , ...partialRow} = row;
            debug('patial row = ', partialRow);
            user = partialRow;
            user.rounds = [];
            debug('got a new user', user);
          }
          const {rid, rname, score} = row; 
          user.rounds.push({rid,rname,score});
        }
        cache.push(user); //final user 
        debug('got the data set the cache');
        setCache.run(JSON.stringify(cache), cid);
        debug('set the cache');
      } else {
        cache = JSON.parse(cache);
      }
    })();
    debug('success return the cache');
    return cache;
  };
})();