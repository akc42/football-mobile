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
  const jwt = require('jwt-simple');
  const bcrypt = require('bcrypt');
  const db = require('../utils/database');

  module.exports = async function(params) {
    debug('request for uid', params.uid);
 
    const result = db.prepare('SELECT * FROM participant WHERE uid = ?').get(params.uid);
    if (result !== undefined) {
      debug('found the user')
      const user = { ...result, password: !!result.password, verification_key: !!result.verification_key, remember: params.remember ? 1 : 0}
      debug('updated user with remember = ', params.remember);
      let token;
      const correct = await bcrypt.compare(params.password,result.password);
      if (correct) {
        debug('user password correct for user ', user.uid);
        const s = db.prepare('SELECT value FROM settings WHERE name = ?').pluck();
        const updateParticipant = db.prepare(`UPDATE participant SET last_logon = (strftime('%s','now')), verification_key = NULL, 
          remember = ? WHERE uid = ?`);
        db.transaction(() => {
          const cookieKey = s.get('cookie_key');
          const cookieExpires = s.get('cookie_expires') * 60 * 60 * 1000;
          const date = Date.now();
          const payload = {
            user: user,
            exp: Math.round(date/ 1000) + cookieExpires
          };
          token = jwt.encode(payload, cookieKey);
          updateParticipant.run(user.remember,user.uid);
        })();
        
        debug('success');
        return { user: user, token: token, state: user.waiting_approval === 0? 'authorised': 'approve' };
      } else {
        debug('password error by user ', user.uid);
        //just fall through to end
      }
    }
    return {user: false, state: 'email'};
  };
})();