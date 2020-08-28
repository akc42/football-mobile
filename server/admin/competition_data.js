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

  const debug = require('debug')('football:api:compdata');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid );
    const competition = db.prepare('SELECT * FROM competition WHERE cid = ?');
    const tic = db.prepare('SELECT MAX(cid) FROM team_in_competition;').pluck();
    const rounds = db.prepare('SELECT * FROM round WHERE cid = ?');
    const teams = db.prepare('SELECT t.*, (SELECT COUNT(*) FROM team_in_competition WHERE tid = t.tid AND cid = ? ) AS inComp FROM team t');
    const registrations =db.prepare('SELECT u.* FROM registration r JOIN participant u USING (uid) WHERE r.cid = ?');
    db.transaction(() => {
      responder.addSection('competition', competition.get(cid));
      const maxtic = tic.get();
      debug('highest cid from teams in competition');
      responder.addSection('maxtic', maxtic);
      responder.addSection('rounds', rounds.all(cid));
      responder.addSection('teams', teams.all(maxtic));
      responder.addSection('users', registrations.all(cid));
    })();
    debug('all done');
  };
})();