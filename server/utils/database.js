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
(()=>{
  'use strict';
  const path = require('path');
  const fs = require('fs');

  const debug = require('debug')('football:db');

  const Database = require('better-sqlite3');
  const dbfilename = path.resolve(__dirname, process.env.FOOTBALL_DB_DIR, process.env.FOOTBALL_DB);
  let db;
  try {
    db = new Database(dbfilename, {fileMustExist:true, timeout: parseInt(process.env.FOOTBALL_DB_BUSY,10)});
  } catch(e) {
    if (e.code === 'SQLITE_CANTOPEN') {
      //looks like database didn't exist, so we had better make if from scratch
      try {
        debug ('could not open database as it did not exist - so now going to create it');
        db = new Database(dbfilename, { fileMustExist: false, timeout: parseInt(process.env.FOOTBALL_DB_BUSY,10) });
        debug('Opened database - ready to start creating structure');
        const database = fs.readFileSync(path.resolve(__dirname, '../db-init', 'database.sql'), 'utf8');
        db.exec(database);
        debug('Successfully updated blank database with script')
      } catch (e) {
        throw new Error(`Encountered ${e.toString()} error when trying to create ${dbfilename}`)
      }
    } else {
      throw new Error(`Encountered ${e.toString()} error when opening database`);
    }      
  }

  db.pragma('foreign_keys = ON');
  process.on('exit', () => db.close());
  module.exports = db;
})();