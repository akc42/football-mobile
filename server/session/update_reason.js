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

  const debug = require('debug')('football:api:updatememberreason');
  const db = require('../utils/database');

  module.exports = async function(params) {
    debug('request received for uid', params.uid);

    const approve = db.prepare('SELECT waiting_approval FROM participant WHERE uid = ?').pluck();
    const updateUser = db.prepare('UPDATE participant SET reason = ? WHERE uid = ?');
    let returnValue = {state:'approve'}
    db.transaction(() => {
      const waiting = approve.get(params.uid);
      debug('waiting = ', waiting);
      if (waiting === 1) {
        updateUser.run(params.reason, params.uid);
      } else {
        returnValue = {state: 'error' };
      }
    })();
    return returnValue;
  };
})();
