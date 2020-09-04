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

  const debug = require('debug')('football:api:roundupd');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid, 'and parameter rid', params.rid );
    if (params.rid !== undefined) {
      let sql = `UPDATE round SET update_date = (strftime('%s','now')),`;
      let qry = [];
      if (params.name !== undefined) {
        sql += ' name = ?,';
        qry.push(params.name);
      }
      if (params.question !== undefined) {
        sql += ' question = ?,';
        qry.push(params.question);
      }
      if (params.comment !== undefined) {
        sql += ' comment = ?,';
        qry.push(params.comment);
      }
      if (params.deadline !== undefined) {
        sql += ' deadline = ?,';
        qry.push(params.deadline);
      }
      if (params.valid_question !== undefined) {
        sql += ' valid_question = ?,';
        qry.push(params.valid_question);
      }
      if (params.open !== undefined) {
        sql += ' open = ?,';
        qry.push(params.open);
      }
      if (params.answer !== undefined) {
        sql += ' answer = ?,';
        qry.push(params.answer)
      }
      if (params.value !== undefined) {
        sql += ' value = ?,'
        qry.push(params.value);
      }
      if (params.bvalue !== undefined) {
        sql += ' bvalue = ?,';
        qry.push(params.bvalue);
      }
      if (params.ou_round !== undefined) {
        sql += ' ou_round = ?,';
        qry.push(params.ou_round);
      }
      //if more params - add here
      sql = sql.slice(0,-1); //remove last comma
      sql += ' WHERE cid = ? AND rid = ?';
      qry.push(cid);
      qry.push(params.rid);
      debug('SQL =', sql, 'parameters of ', qry);
      if (qry.length > 1) {
        const upd = db.prepare(sql);
        const read = db.prepare('SELECT * FROM round WHERE cid = ? AND rid = ?');
        db.transaction(() => {
          upd.run(qry);
          responder.addSection('round', read.get(cid, params.rid));
        })();
      }
    }
    debug('All done');
  };
})();