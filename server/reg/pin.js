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
    debug('pin', payload.pin);
    const password = await new Promise((accept, reject) => {
      bcrypt.hash(payload.pin, 10, (err, result) => {
        if (err) { reject(err); } else accept(result);
      });
    });
    const db = await dbOpen();
    await db.exec('BEGIN TRANSACTION');
    const user = await db.get('SELECT * FROM participant')




    
    debug('Success regpin');
    return true;
  };
})();