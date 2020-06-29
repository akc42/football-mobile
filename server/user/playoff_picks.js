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
    
    db.transaction(() => {
      const deadline = db.prepare('SELECT pp_deadline FROM competition WHERE cid = ?').pluck().get(cid);
      responder.addSection('deadline', deadline);
      const confs = db.prepare('SELECT confid, name FROM conference').all();
      responder.addSection('confs', confs);
      const divs = db.prepare('SELECT divid, name FROM division').all();
      responder.addSection('divs', divs);
      const teams = db.prepare(`SELECT t.*, c.made_playoff, c.points 
        FROM team t JOIN team_in_competition c USING(tid) WHERE c.cid = ?`).all(cid);
      responder.addSection('teams', teams);
      const picks = db.prepare(`SELECT u.uid, u.name, s.score, p.tid, p.admin_made, p.submit_time FROM participant u JOIN playoff_picks p USING(uid) JOIN playoff_score s USING(cid,uid) WHERE p.cid = ? ORDER BY uid`).all(cid);
      responder.addSection('picks', picks);
    })();
  };
})();