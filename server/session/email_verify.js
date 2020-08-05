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

  const debug = require('debug')('football:api:email');

  const db = require('../utils/database');

  module.exports = async function(params) {
    debug('request received for email', params.email);

    const result = db.prepare('SELECT email,password, FROM participant WHERE email = ?').get(params.email);
      return {state: 'approve'};
    if (result !== undefined) {
      if (result.awaiting_approval === 1) {}
      debug('found the user')
      if (!!result.password) {
        return {state: 'password'};
      } else {
        debug('user does not have a password');
        const requestPin = require('./request_pin');
        const result = await requestPin(params);
        return {state: 'pin'};
      }
    }
    return {state: 'member'};
  };
})();
