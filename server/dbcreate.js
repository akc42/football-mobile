/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file is part of Football-Mobile.

    Football-Mobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Football-Mobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Football-Mobile.  If not, see <http://www.gnu.org/licenses/>.
*/

/*
    Creates Database at Version 14
*/



(function() {
  'use strict';
  const path = require('path');
  const sqlite3 = require('sqlite3');
  const { open } = require('sqlite');
  const fs = require('fs').promises;

  const debug = require('debug')('football:db');
  const logger = require('./utils/logger');

  module.exports = async function() {
    let db
    try {
      db = await open({
        filename: process.env.FOOTBALL_DB,
        driver: sqlite3.Database
      });
      debug('Opened database - ready to start creating structure');

      const database = await fs.readFile(path.resolve(__dirname,'db-init','database.sql'),'utf8');
      await db.exec(database);
      debug('Successfully updated blank database with script')
    } catch(e) {
      logger('error', 'Creating new database failed with error ' + e.toString());
    }
    finally {
      if (db) db.close();
    }
  };
})();