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
    const getGap = db.prepare('SELECT gap FROM compeition WHERE cid = ?');
    const round = db.prepare('SELECT rid FROM rounds WHERE open = 1 AND cid = ? ORDER BY rid DESC LIMIT 1').pluck();
    const poffs = db.prepare(`SELECT count(*) FROM competition c WHERE c.open = 1 AND c.cid = ? 
      AND strftime('%s','now') < c.pp_deadline`).pluck()
    const bonus = db.prepare(`SELECT valid_question FROM round WHERE cid = ? AND rid = ? AND strftime('%s','now') < deadline `).pluck();
    const picks = db.prepare(`SELECT COUNT(*) FROM match WHERE cid = ? AND rid = ? AND (strftime('%s','now') + 60 * ?) < match_time`).pluck(); 

    db.transaction(() => {
      const rid = round.get(cid);
      if (rid === undefined) {
        debug('no open round');
        responder.addSection('rid', 0);
        responder.addSection('poff', poffs.get(cid));
      } else {
        debug('round selected = ', rid);
        responder.addSection('rid', rid);
        const valid = bonus.get(cid, rid);
        responder.addSection('bonus', valid !== undefined && valid === 1);
        const gap = getGap.get(cid);
        const matches = picks.get(cid, rid, gap)
        responder.AddSection('matches', );
        debug('bonus', valid !== undefined && valid === 1,'matches', matches)
      }
    })();
    debug('All Done');
  };
})();