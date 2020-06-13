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
  const dbOpen = require('../utils/database');

  module.exports = async function(params) {
    debug('logon request received for usage', params.usage);
    const db = await dbOpen();
    await db.exec('BEGIN TRANSACTION');
    const result = await db.get(
      'SELECT * FROM participant WHERE email = ? ;',
      params.email
    );
    if (result !== undefined) {
      debug('found the user')
      const user = { ...result, password: !!result.password, verification_key: !!result.verification_key, remember: result.remember !== 0}

      const correct = await new Promise((accept, reject) => 
        bcrypt.compare(params.password,result.password,(err,result) => {
          if (err) {reject(err);} else accept(result);
      })); 

      let usage; 
      if (correct) {
        debug('user password correct for user ', user.uid);
        user.remember = params.remember;

        await db.run(`UPDATE participant SET last_logon = (strftime('%s','now')), verification_key = NULL, remember = ? WHERE uid = ?`,
                  params.remember,user.uid);
        debug('updated user with remember = ', params.remember);
        usage = params.usage;

      } else {
        debug('password error by user ', uid);
      }
      await db.exec('COMMIT');
      await db.close();

      debug('success');
      return {user: user, usage:usage};
    }
    await db.close();
    debug('record not found');
    return {user: false};
  };
})();