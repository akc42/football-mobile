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
  const dbOpen = require('../utils/database');
  
  //set up to produce a promise that is resolved already when the user first calls us
  async function getCookieInfo() {
    const db = await dbOpen();
    await db.exec('BEGIN TRANSACTION');  
    const s = await db.prepare('SELECT value FROM settings WHERE name = ?');
    const { value: cookieKey } = await s.get('cookie_key');
    const { value: cookieName } = await s.get('cookie_name');
    await s.finalize();
    await db.exec('COMMIT');
    await db.close()
    return {cookieKey:cookieKey,cookieName:cookieName};
  }
  const cookiePromise = getCookieInfo();

  module.exports = async function(params) {
    debug('checking cookie');
    const cookies = req.headers.cookie;
    if (cookies) {
      const cookieInfo = await cookiePromise; //it should aready be done, avoiding db request every call
      const mbball = new RegExp(`^(.*; +)?${cookieInfo.cookieName}=([^;]+)(.*)?$`);
      const matches = cookies.match(mbball);
      if (matches) {
        debug('Cookie found')
        const token = matches[2];
        try {
          const payload = jwt.decode(token, cookieInfo.cookieKey);  //this will throw if the cookie is expired
          debug('Success validate');
          return payload;
        } catch(e) {
          debug('cookie expired'); //so we fall through to return a null value;
        }
      }
    }
    debug('user not found')
    return {};
  };
})();