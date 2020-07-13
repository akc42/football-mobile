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

  const debug = require('debug')('football:api:competition_scores');
  const db = require('../utils/database');
  
  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, ' for cid', cid);
    // lets build some prepared queries we might need later.
    const readCache = db.prepare(`SELECT results_cache FROM competition WHERE cid = ? AND results_cache IS NOT NULL AND cache_store_date > (
      SELECT CASE WHEN value = 0 THEN 0 ELSE strftime('%s','now') - (3600 * value) END As expiry FROM settings WHERE name = 'cache_age')`).pluck();
    debug('prepared cache read - now see if we can build build score cache assuming cache not available')
    const makeUsersCache = db.prepare(`SELECT u.uid,u.name AS name,sum(rs.score) AS rscore, sum(rs.bscore) AS bscore, 
      sum(rs.mscore) AS mscore, p.pscore AS lscore, sum(rs.score) + p.pscore AS tscore 
      FROM participant u JOIN registration r USING (uid) JOIN round_score rs USING (cid,uid)
      JOIN ( SELECT cid,uid,sum(score) as pscore FROM playoff_score GROUP BY cid,uid ) p USING (cid,uid) 
      WHERE r.cid = ? GROUP BY u.uid,u.name,p.pscore; `);
    const makeRoundsCache = db.prepare(`SELECT uid,r.rid, score, bscore, mscore, pscore, oscore FROM round_score rs 
    JOIN round r USING (cid,rid) WHERE r.cid = ? AND r.open = 1`);
    debug('now prepare the install the cache');
    const readRoundData = db.prepare('SELECT rid,name FROM round WHERE cid= ? ');
    const setCache = db.prepare(`UPDATE competition SET results_cache = ?, cache_store_date = strftime('%s','now') WHERE cid = ?`);
    db.transaction(() => {
      debug('in transaction')
      let cache = readCache.get(cid);
      debug('tried to read cache');
      if (!cache) {
        debug('cache not found - get user section of cache');
        //no cache, so we are going to have to build it.
        cache = {};
        cache.users = makeUsersCache.all(cid);
        debug('found ', cache.users.length ,'cache users, now get round info');
        cache.rounds = makeRoundsCache.all(cid);
        debug('found', cache.rounds.length/cache.users.length, 'sets of round data');
        setCache.run(JSON.stringify(cache), cid);
        debug('set the new cache');
      } else {
        cache = JSON.parse(cache);
      }
      responder.addSection('cache',cache);
      debug('get addition round data info (name basically)');
      responder.addSection('rounds', readRoundData.all(cid));
    })();
    debug('All Done');
  };
})();