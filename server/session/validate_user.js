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

  const debug = require('debug')('football:api:validate');

  const jwt = require('jwt-simple');
  const db = require('../utils/database');
  let cookieKey;  
  let cookieExpires
  db.transaction(() => {
    const s = db.prepare('SELECT value FROM settings WHERE name = ?').pluck();
    cookieKey = s.get('cookie_key');
    cookieExpires = s.get('cookie_expires') * 60 * 60;
  })(); 

  module.exports = function(params) {
    debug('checking token');
    if (params.token !== undefined) {
      debug('token found')
      try {
        const payload = jwt.decode(params.token, cookieKey);  //this will throw if the token is expired
        debug('Success validate');
        const date = Date.now();
        payload.exp  = Math.round(date/1000) + cookieExpires;
        const token = jwt.encode(payload, cookieKey);  //update the token for another expiry
        return {user:payload.user, token: token};
      } catch(e) {
        debug('token expired'); //so we fall through to return a null value;
      }
    }
    debug('user not found')
    return {};
  };
})();