/**
@licence
    Copyright (c) co Alan Chandler, all rights reserved

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

  const debug = require('debug')('football:api:matchupd');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid, 'rid', params.rid, 'aid', params.aid );
    if (params.rid !== undefined) {
      let sql = `UPDATE match SET`;
      let qry = [];
      if (params.hid !== undefined) {
        sql += ' hid = ?,';
        qry.push(params.hid);
      }
      if (params.comment !== undefined) {
        sql += ' comment = ?,';
        qry.push(params.comment);
      }
      if (params.ascore !== undefined) {
        sql += ' ascore = ?,';
        qry.push(params.ascore);
      }
      if (params.hscore !== undefined) {
        sql += ' hscore = ?,';
        qry.push(params.hscore );
      }
      if (params.combined_score !== undefined) {
        sql += ' combined_score = ?,';
        qry.push(params.combined_score);
      }
      if (params.match_time !== undefined) {
        sql += ' match_time = ?,';
        qry.push(params.match_time);
      }
      if (params.underdog !== undefined) {
        sql += ' underdog = ?,';
        qry.push(params.underdog);
      }
      if (params.open !== undefined) {
        sql += ' open = ?,';
        qry.push(params.open);
      }
      //if more params - add here
      sql = sql.slice(0,-1); //remove last comma
      sql += ' WHERE cid = ? AND rid = ? AND aid = ?';
      qry.push(cid);
      qry.push(params.rid);
      qry.push(params.aid);
      debug('SQL =', sql, 'parameters of ', qry);
      if (qry.length > 1) {
        const upd = db.prepare(sql);
        const invalidateCompetitionCache = db.prepare('UPDATE competition SET results_cache = NULL WHERE cid = ?');
        const invalidateRoundCache = db.prepare('UPDATE round SET results_cache = NULL WHERE cid = ? AND rid = ?');
        const read = db.prepare('SELECT * FROM match WHERE cid = ? AND rid = ? AND aid = ?');
        db.transaction(() => {
          upd.run(qry);
          invalidateCompetitionCache.run(cid)
          invalidateRoundCache.run(cid, params.rid);
          responder.addSection('match', read.get(cid, params.rid, params.aid));
        })();
      }
    }
    debug('All done');
  };
})();