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

  const debug = require('debug')('football:api:maketic');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid );
    const points = db.prepare('SELECT default_playoff FROM competition WHERE cid = ?').pluck();
    const tic = db.prepare('SELECT MAX(cid) FROM team_in_competition;').pluck();
    const maketic = db.prepare('INSERT INTO team_in_competition (cid, tid, points) SELECT ? as cid, tid , ? AS points FROM team_in_competition WHERE cid= ?'); 
    const invalidateCompetitionCache = db.prepare('UPDATE competition SET results_cache = NULL WHERE cid = ?');
    const teams = db.prepare(`SELECT t.*, i.points, i.eliminated,i.made_playoff, i.update_date FROM team t 
      LEFT JOIN team_in_competition i ON i.tid = t.tid AND i.cid = ?`);
    db.transaction(() => {
      const maxtic = tic.get();
      if (maxtic < cid) {
        //only do this if  we haven't done it already
        const poffp = points.get(cid);
        maketic.run(cid, poffp, maxtic);
        invalidateCompetitionCache.run(cid)
        responder.addSection('status', true);
      } else {
        responder.addSection('status', false);
      }
      responder.addSection('teams', teams.all(cid));
    })();
  };
})();