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

  const debug = require('debug')('football:api:logon');

  const bcrypt = require('bcrypt');
  const db = require('../utils/database');

  module.exports = async function(params) {
    debug('logon request received for usage', params.usage);
 
    const result = db.prepare('SELECT * FROM participant WHERE email = ?').get(params.email);
    
    if (result !== undefined) {
      debug('found the user')
      const user = { ...result, password: !!result.password, verification_key: !!result.verification_key}
      const correct = await bcrypt.compare(params.password,result.password);

      let usage; 
      if (correct) {
        debug('user password correct for user ', user.uid);
        user.remember = params.remember;

        db.prepare(`UPDATE participant SET last_logon = (strftime('%s','now')), verification_key = NULL, remember = ? WHERE uid = ?`)
          .run(params.remember,user.uid);
        debug('updated user with remember = ', params.remember);
        debug('success');
        return { user: user, usage: 'authorised' };
      } else {
        debug('password error by user ', uid);
      }

    }
    return {user: false};
  };
})();