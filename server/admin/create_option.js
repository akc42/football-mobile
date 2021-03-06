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

  const debug = require('debug')('football:api:optioncreate');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid, ', option', params.opid );
    const create = db.prepare('INSERT INTO option (cid, rid, opid, label) VALUES (?,?,?,?)');
    const invalidateCompetitionCache = db.prepare('UPDATE competition SET results_cache = NULL WHERE cid = ?');
    const invalidateRoundCache = db.prepare('UPDATE round SET results_cache = NULL WHERE cid = ? AND rid = ?');
    const options = db.prepare('SELECT opid, label FROM option WHERE cid = ? AND rid = ? ORDER BY opid');
    db.transaction(() => {
      create.run(cid, params.rid, params.opid, params.label);
      invalidateCompetitionCache.run(cid)
      invalidateRoundCache.run(cid, params.rid);
      responder.addSection('options', options.all(cid, params.rid));
    })();
    debug('call complete');
    
  };
})();