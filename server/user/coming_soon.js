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

  const debug = require('debug')('football:api:comingsoon');
  const db = require('../utils/database');

  module.exports = function (user, cid, params, responder) {
    debug('got request');
    const s = db.prepare(`SELECT value FROM settings WHERE name = 'coming_soon_message'`).pluck();
    const e = db.prepare('SELECT expected_date, condition, open FROM competition WHERE cid = ?');
    db.transaction(() => {
      
      const row = e.get(cid);
      if (row.open !== 1) {
        debug('competition not open, so send data about when it might be')
        responder.addSection('open', false);
        responder.addSection('date', row.expected_date);
        responder.addSection('condition', row.condition);
        responder.addSection('message', s.get());
      } else {
        debug('competiion is open, so just say so');
        responder.addSection('open', true);
      }
    })();
    debug('Success');

  };
})();