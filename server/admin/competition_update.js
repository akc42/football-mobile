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

  const debug = require('debug')('football:api:compupd');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid, 'and parameter cid', params.cid );
    let sql = 'UPDATE Competition SET';
    let qry = [];
    if (params.cid === cid) {
      if (params.name !== undefined) {
        sql += ' name = ?,';
        qry.push(params.name);
      }
      if (params.expected_date !== undefined) {
        sql += ' expected_date = ?,';
        qry.push(params.expected_date);
      }
      if (params.condition !== undefined) {
        sql += ' condition = ?,';
        qry.push(params.condition);
      }
      if (params.pp_deadline !== undefined) {
        sql += ' pp_deadline = ?,';
        qry.push(params.pp_deadline);
      }
      if (params.gap !== undefined) {
        sql += ' gap = ?,';
        qry.push(params.gap);
      }
      if (params.open !== undefined) {
        sql += ' open = ?,';
        qry.push(params.open);
      }
      if (params.closed !== undefined) {
        sql += ' closed = ?,';
        qry.push(params.closed)
      }
      //if more params more 
      sql = sql.slice(0,-1); //remove last comma
      sql += ' WHERE cid = ?';
      qry.push(cid);
      debug('SQL =', sql, 'parameters of ', qry);
      if (qry.length > 1) {
        const upd = db.prepare(sql);
        const read = db.prepare('SELECT * FROM Competition WHERE cid = ?');
        db.transaction(() => {
          upd.run(qry);
          responder.addSection('competition', read.get(cid));
        })();
      }
    }
    debug('All done');
  };
})();