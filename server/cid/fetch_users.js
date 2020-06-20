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

  const debug = require('debug')('football:api:fetchusers');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, ' for cid', cid);
    // lets build some prepared queries we might need later.
    const readCache = db.prepare(`SELECT results_cache FROM competition WHERE cid = ? AND results_cache IS NOT NULL AND cache_store_date > (
      SELECT CASE WHEN value = 0 THEN 0 ELSE strftime('%s','now') - (3600 * value) END As expiry FROM settings WHERE name = 'cache_age')`).pluck();
    debug('prepared cache read - now see if we can build build score cache assuming cache not available')
    const makeCache = db.prepare(`SELECT r.rid AS rid, r.name AS rname,r.score AS score,t.uid AS uid,t.name AS name,
      t.rscore AS rscore,t.pscore AS pscore,(t.rscore + t.pscore) AS tscore
      FROM (
        SELECT r.cid,u.uid,u.name AS name,sum(rs.score) AS rscore,p.pscore
        FROM participant u JOIN registration r USING (uid)
        JOIN round_score rs USING (cid,uid)
        JOIN (
          SELECT cid,uid,sum(score) as pscore
          FROM playoff_score GROUP BY cid,uid
        ) p USING (cid,uid)
        GROUP BY r.cid,u.uid,u.name,p.pscore
      ) t
        JOIN (
          SELECT cid,uid,rounds.name, rounds.rid,score 
          FROM round_score rs JOIN (
            SELECT cid,rid,name FROM round
            WHERE cid = ? AND open = 1  
        ) AS rounds USING (cid,rid) 
      ) r USING (cid,uid)  
      ORDER BY (pscore + rscore) DESC, t.name COLLATE NOCASE,rid DESC;`);
    debug('now prepare the install the cache')
    const setCache = db.prepare(`UPDATE competition SET results_cache = ?, cache_store_date = strftime('%s','now') WHERE cid = ?`);
    debug('lets do it')
    let cache;
    db.transaction(() => {
      debug('in transaction')
      cache = readCache.get(cid);
      debug('tried to read cache');
      if (!cache) {
        debug('cache not found');
        //no cache, so we are going to have to build it.
        cache = []
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
    debug('completed database work');
    //extract the data we want from the cache
    responder.addSection('users');
    for (const user of cache) {
      const {rounds, ...row} = user;
      responder.write(row);
      debug('written row ', row);
    }
    debug('all done');
  };
})();