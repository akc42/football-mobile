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

  const debug = require('debug')('football:api:round_data');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid , 'and rid',params.rid);
    // lets build some prepared queries we might need later.
    const readCache = db.prepare(`SELECT results_cache FROM round WHERE cid = ? and rid = ? 
      AND results_cache IS NOT NULL AND cache_store_date > (
      SELECT CASE WHEN value = 0 THEN 0 ELSE strftime('%s','now') - (3600 * value) END As expiry 
      FROM settings WHERE name = 'cache_age')`).pluck();
    const readRound = db.prepare(`SELECT rid, name, open, valid_question, question, comment, answer, value, bvalue, ou_round, deadline
      FROM round where cid = ? and rid = ?`);
    const readTeams = db.prepare(`SELECT m.aid, ta.name as aname,  th.name as hname 
      FROM match m JOIN team ta ON m.aid = ta.tid JOIN team th ON m.hid = th.tid 
      WHERE m.cid = ? AND m.rid = ? AND m.open = 1 ORDER BY m.match_time, m.aid`);
    const usersRound = db.prepare(`SELECT u.name, u.uid AS uid , r.pscore, r.oscore, r.mscore,r.bscore,r.score, 
      p.opid, p.comment,p.admin_made,p.submit_time FROM round_score r JOIN participant u USING (uid) 
      LEFT JOIN option_pick p USING (cid,rid,uid) WHERE r.cid = ? AND r.rid = ? ORDER BY r.score DESC,u.name COLLATE NOCASE;`);
    const matchesRound = db.prepare(`SELECT aid,hid,ascore,hscore,combined_score,match_time, match_time - gap AS deadline,comment,underdog
      FROM match m JOIN competition c USING(cid) WHERE m.cid = ? AND rid = ? AND m.open = 1`);
    const usersPicks = db.prepare(`SELECT m.uid,m.aid, m.pscore, m.oscore, p.pid, p.over_selected, p.comment,
      p.admin_made, p.submit_time FROM match_score m LEFT JOIN pick p USING (cid,rid,aid,uid) 
      WHERE m.cid = ? AND m.rid = ?`);
    const optionsRound = db.prepare(`SELECT opid,label FROM option WHERE cid = ? AND rid = ?`);
    const setCache = db.prepare(`UPDATE round SET results_cache = ?, cache_store_date = strftime('%s','now') 
      WHERE cid = ? AND rid = ?`);   
    const nextRid = db.prepare('SELECT rid FROM round WHERE cid = ? AND rid > ? AND round.open = 1 ORDER BY rid ASC LIMIT 1').pluck();
    const previousRid = db.prepare('SELECT rid FROM round WHERE cid = ? AND rid < ? AND round.open = 1 ORDER BY rid DESC LIMIT 1').pluck();
    
    db.transaction(() => {
      debug('in transaction')
      let cache = readCache.get(cid, params.rid);
      debug('tried to read cache');
      if (!cache) {
        debug('cache not found');
        cache = {};
        cache.users = usersRound.all(cid, params.rid);
        debug('got users')
        cache.matches = matchesRound.all(cid, params.rid);
        debug('got matches');
        cache.options = optionsRound.all(cid, params.rid);
        debug('got options');
        cache.picks = usersPicks.all(cid, params.rid);
        debug('got picks')
        setCache.run(JSON.stringify(cache), cid, params.rid);
        debug('wrote new cache');
      } else {
        cache = JSON.parse(cache);
      }
      responder.addSection('cache', cache);
      debug('read round basic info');
      responder.addSection('round', readRound.get(cid, params.rid));
      debug('add team info');
      responder.addSection('teams', readTeams.all(cid,params.rid));
      const next = nextRid.get(cid, params.rid);
      responder.addSection('next', next === undefined ? 0 : next);
      const previous = previousRid.get(cid, params.rid);
      responder.addSection('previous', previous === undefined ? 0 : previous);

    })();
    debug('All Done');
  };
})();