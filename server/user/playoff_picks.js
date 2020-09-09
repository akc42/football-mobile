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

  const debug = require('debug')('football:api:picks');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid );
    const deadline = db.prepare('SELECT pp_deadline FROM competition WHERE cid = ?').pluck();
    const confs = db.prepare('SELECT confid, name FROM conference');
    const divs = db.prepare('SELECT divid, name FROM division');
    const teams = db.prepare(`SELECT t.*, c.made_playoff, c.points , c.update_date
        FROM team t JOIN team_in_competition c USING(tid) WHERE c.cid = ?`);
    const users = db.prepare(`SELECT u.uid, u.name, SUM(p.score) FILTER(WHERE p.confid='AFC') ascore, SUM(p.score) FILTER(where p.confid = 'NFC') nscore, 
        SUM(p.score) pscore FROM participant u JOIN registration r USING (uid) LEFT JOIN playoff_score p USING (cid,uid) WHERE r.cid = ? 
        GROUP BY u.uid, u.name`);
    const picks = db.prepare(`SELECT p.uid, p.tid, p.admin_made, p.submit_time 
        FROM playoff_picks p WHERE p.cid = ? ORDER BY p.uid`);
    db.transaction(() => {
      debug('in transaction');
      responder.addSection('deadline', deadline.get(cid));
      responder.addSection('confs', confs.all());
      responder.addSection('divs', divs.all());
      responder.addSection('teams', teams.all(cid));
      responder.addSection('users', users.all(cid));
      responder.addSection('picks', picks.all(cid));
    })();
    debug('all done');
  };
})();