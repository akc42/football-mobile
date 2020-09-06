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

  const debug = require('debug')('football:api:teamspoints');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid );
    const getp = db.prepare('SELECT default_playoff FROM competition WHERE cid = ?').pluck();
    const setp = db.prepare('UPDATE team_in_competition SET points = ? WHERE cid = ?');
    const invalidateCompetitionCache = db.prepare('UPDATE competition SET results_cache = NULL WHERE cid = ?');
    let points;
    db.transaction(() =>{
      points = getp.get(cid);
      setp.run(points,cid);
      invalidateCompetitionCache.run(cid)
      
    })();
    responder.addSection('points', points);
  };
})();