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

  const debug = require('debug')('football:api:registercond');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid );
    const {open, condition, agree_time} = db.prepare(`SELECT c.open, c.condition, r.agree_time FROM competition c 
      LEFT JOIN registration r ON r.cid = c.cid AND r.uid = ? WHERE c.cid = ?`).get(user.uid,cid);
    responder.addSection('open', open);
    responder.addSection('condition', condition);
    responder.addSection('agreed', agree_time === null ? 0 : agree_time);
    debug('All Done');
  };
})();