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

    const result = db.prepare('SELECT email,password, waiting_approval FROM participant WHERE email = ?').get(params.email);;
    if (result !== undefined) {
      debug('result = ', result);
      if (result.waiting_approval === 1) return {state: 'approve'};
      debug('not a user waiting approval');
      if (!!result.password) return {state: 'password'};
      debug('user does not have a password so this must be first visit so we will request pin');
      const requestPin = require('./request_pin');
      await requestPin(params);
      return {state: 'welcome'};
    }
    return {state: 'member'};
  };
})();
