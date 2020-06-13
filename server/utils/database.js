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

const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs').promises;

const debug = require('debug')('football:db');
const logger = require('./logger');

if (process.env.DB_DEBUG !== undefined) {
  sqlite3.verbose();
}


module.exports = async ()=> {
  debug('Open Database Called');
  let db;
  try {
    const dbfilename = path.resolve(__dirname, process.env.FOOTBALL_DB_DIR, process.env.FOOTBALL_DB);
    db = await open({
      filename: dbfilename,
      mode: sqlite3.OPEN_READWRITE,
      driver: sqlite3.Database
    })
  } catch(e) {
    if (e.code === 'SQLITE_CANTOPEN') {
      //looks like database didn't exist, so we had better make if from scratch
      try {
        debug ('could not open database as it did not exist - so now going to create it');
        db = await open({
          filename: dbfilename,
          driver: sqlite3.Database
        });
        debug('Opened database - ready to start creating structure');
        const database = await fs.readFile(path.resolve(__dirname, process.env.FOOTBALL_DB_DIR, 'database.sql'), 'utf8');
        await db.exec(database);
        debug('Successfully updated blank database with script')
      } catch (e) {
        throw new Error(`Encountered ${e.toString()} error when trying to create ${dbFilename}`)
      }
    } else {
      throw new Error(`Encountered ${e.toString()} error when opening database`);
    }      
  }
  await db.exec('PRAGMA foreign_keys = ON;');
  await db.exec('PRAGMA busy_timeout = ' + process.env.FOOTBALL_DB_BUSY)
  return db;
}