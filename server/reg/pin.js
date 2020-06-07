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
  const bcrypt = require('bcrypt');
  const debug = require('debug')('football:api:regpin');
  const dbOpen = require('../utils/database');

  module.exports = async function(payload) {
    debug('pin', payload.pin, 'for user', payload.user);
    const password = await new Promise((accept, reject) => {
      bcrypt.hash(payload.pin, 10, (err, result) => {
        if (err) { reject(err); } else accept(result);
      });
    });
    let returnValue; //it will stay undefined if we don't find the person
    const db = await dbOpen();
    await db.exec('BEGIN TRANSACTION');
    const result = await db.get('SELECT * FROM participant WHERE uid = ?;', payload.user);
    if (result !== undefined) {
      debug('found the user');
      if (password === result.verification_key) {
        debug('password is correct, so update verification_key (to NULL) and return user');
        //we got the expected result so we can in effect log the person in, but we do need to reset the verification key
        await db.exec('UPDATE participant SET verification_key = NULL WHERE uid = ?', payload.user);
        returnValue = user = { ...result, password: !!result.password, verification_key: !!result.verification_key }
      } else {
        debug('password incorrect - assume a later pin has been sent');
      }
    } else {
      debug('did not find the user')
    }
    await db.exec('COMMIT');
    await db.close();    
    debug('Success regpin');
    return returnValue;
  };
})();