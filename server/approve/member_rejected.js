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

  const debug = require('debug')('football:api:memberreject');
  const db = require('../utils/database');

  module.exports = async function(user, params, header, responder) {
    debug('new request from user', user.uid,'to reject', params.uid);
    const checkParticipant = db.prepare('SELECT waiting_approval FROM participant WHERE uid = ?').pluck();
    const deleteParticipant = db.prepare(`DELETE FROM participant WHERE uid = ?`);
    const refreshMembers = db.prepare('SELECT * FROM participant WHERE waiting_approval = 1');
    db.transaction(() => {
      const wait = checkParticipant.get(params.uid);
      if (wait === 1) {
        deleteParticipant.run(params.uid);
        responder.addSection('members', refreshMembers.all());
      }
    })();
    debug('All done');

    
  };
})();