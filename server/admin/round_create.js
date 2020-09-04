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

  const debug = require('debug')('football:api:roundcreate');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid, ',rid', params.rid );
    const defaults = db.prepare('SELECT default_bonus, default_points FROM Competition WHERE cid = ?');
    const createRound = db.prepare('INSERT INTO round (cid, rid, name, bvalue, value, deadline, answer) VALUES (?,?, ?, ?, ?, 0, 0)');
    const rounds = db.prepare('SELECT * FROM round WHERE cid = ? ORDER BY rid DESC');
    db.transaction(() => {
      const {default_bonus, default_points} = defaults.get(cid);
      createRound.run(cid, params.rid, params.name, default_bonus, default_points);
      responder.addSection('rid', params.rid);
      responder.addSection('rounds', rounds.all(cid));
    })();
    debug('request complete')    
  };
})();