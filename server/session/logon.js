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
    const db = await dbOpen();
    await db.exec('BEGIN TRANSACTION');
    const result = await db.get(
      'SELECT * FROM participant WHERE email = ? ;',
      params.email
    );
    if (result !== undefined) {
      const user = { ...result, password: !!result.password, verification_key: !!result.verification_key}

      const s = await db.prepare('SELECT value FROM settings WHERE name = ?');
      const { value: cookieKey } = await s.get('cookie_key');
      const {value: cookieName} = await s.get('cookie_name');
      const { value: cookieExpires } = await s.get('cookie_expires');

      await s.finalize();
      const now = new Date();

      //not doing this too fast since last time
      
      const password = await new Promise((accept, reject) => {
        bcrypt.hash(params.password,10,(err,result) => {
          if (err) {reject(err);} else accept(result);
        });
      });
      
      const payload = {
        exp: new Date().setTime(now.getTime() + (cookieExpires * 60 * 60 * 1000 )),
        user: user,
        
      }
      
      const token = jwt.encode(payload, cookieKey);
      debug('made token', token);
/*
      await db.exec('UPDATE participant SET verification_key = ?, verification_sent = CURRENT_TIMESTAMP WHERE uid = ?', verificationKey, user.uid);
*/    
      await db.exec('COMMIT');
      await db.close();

      debug('success');
      return {found: true, password: user.password};
    }
    await db.close();
    debug('record not found');
    return {found: false};
  };
})();