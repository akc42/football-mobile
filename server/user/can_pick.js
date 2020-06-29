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

  const debug = require('debug')('football:api:canpick');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid );
    db.transaction(() => {
      const matches = db.prepare(`SELECT count(*) FROM competition c WHERE c.open = 1 AND c.cid = ? AND
        EXISTS ( 
 	        SELECT r.rid FROM round r WHERE r.cid = c.cid AND r.open = 1 AND (
            EXISTS (
              SELECT m.aid FROM match m WHERE m.cid = r.cid and m.rid = r.rid AND m.open = 1 AND (strftime('%s','now') + c.gap) < m.match_time 
              AND NOT EXISTS (
                  SELECT 1 FROM pick pk WHERE pk.cid = m.cid AND pk.rid = m.rid AND pk.uid = ? AND pk.aid = m.aid
              )
            )
            OR (
 			        r.valid_question = 1 AND strftime('%s','now') < r.deadline
 			        AND NOT EXISTS (
 				        SELECT 1 FROM option_pick o WHERE o.cid = r.cid AND o.rid = r.rid AND o.uid = ?
 			        ))))`).pluck().get(cid, user.uid, user.uid);
      responder.addSection('matches', matches !== 0);

      const poffs = db.prepare(`SELECT count(*) FROM competition c WHERE c.open = 1 AND c.cid = ? AND strftime('%s','now') < c.pp_deadline
          AND (
            EXISTS (
              SELECT f.confid, d.divid FROM conference f JOIN division d WHERE 
              NOT EXISTS (SELECT 1 FROM div_winner_pick p WHERE cid = c.cid AND uid = ? AND p.confid = f.confid AND p.divid = d.divid)
            )
            OR EXISTS (
              SELECT f.confid FROM conference f  WHERE
              NOT EXISTS (SELECT 1 FROM wildcard_pick w WHERE w.cid = c.cid and uid = ? AND w.confid = f.confid  and opid=1)
              OR NOT EXISTS (SELECT 1 FROM wildcard_pick w WHERE w.cid = c.cid and uid = ? AND w.confid = f.confid  and opid=2)
          )
        )`).pluck().get(cid, user.uid, user.uid, user.uid);
      if (matches !==0 || poffs !== 0) {
        responder.addSection('canPick', true);
      } else {
        responder.addSection('canPick', false);
        const results = db.prepare(`SELECT count(*) FROM competition c JOIN round r ON r.cid = c.cid AND r.rid = (
		                                  SELECT r.rid FROM round WHERE cid = c.cid AND open = 1 ORDER BY rid DESC LIMIT 1
                                    ) WHERE c.open = 1 AND c.cid = ? AND (	EXISTS ( 
                                        SELECT 1 FROM match m WHERE m.cid = r.cid and m.rid = r.rid AND m.open = 1
                                    ) OR r.valid_question = 1) `).pluck().get(cid);
        responder.addSection('hasPicked', results !== 0);
      }
    })();
  };
})();