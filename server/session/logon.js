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

  module.exports = async function(headers, params) {
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

      const s = await db.prepare('SELECT value FROM settings WHERE name = ?');
      const { value: cookieKey } = await s.get('cookie_key');
      const {value: cookieName} = await s.get('cookie_name');
      const { value: cookieExpires } = await s.get('cookie_expires');

      await s.finalize();
      const now = new Date();
      
      const password = await new Promise((accept, reject) => {
        bcrypt.hash(params.password,10,(err,result) => {
          if (err) {reject(err);} else accept(result);
        });
      }); 

      let token; 
      if (result.password === password) {
        debug('user password correct for user ', user.uid);
        user.remember = params.remember;

        await db.exec(`UPDATE participant SET last_logon = (strftime('%s','now')), verification_key = NULL, remember = ? WHERE uid = ?`,
                  params.remember,user.uid);
        debug('updated user with remember = ', params.remember)
        const payload = {
          exp: new Date().setTime(now.getTime() + (cookieExpires * 60 * 60 * 1000 )), //set this even though it may not get remembered
          user: user,
          usage: params.usage
        }
        token = jwt.encode(payload, cookieKey);
        debug('made token', token);

      } else {
        debug('password error by user ', uid);
      }
      await db.exec('COMMIT');
      await db.close();

      debug('success');
      return {found: true, password: user.password, remember: user.remember, token};
    }
    await db.close();
    debug('record not found');
    return {found: false};
  };
})();