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
(function () {
  'use strict';

  const debug = require('debug')('football:db');
  const logger = require('../utils/logger');

  module.exports = async function (db) {
    try {
      debug('foreign keys off');
      await db.exec('PRAGMA foreign_keys = OFF;');
      debug('begin exclusive');
      await db.exec('BEGIN EXCLUSIVE');
      
      debug('update participant table, by copying out and back');
      await db.exec(`CREATE TABLE old_participant (
          uid integer PRIMARY KEY,
          name character varying,
          email character varying,
          password character varying, --stores md5 of password to enable login if doing local authentication
          last_logon bigint DEFAULT (strftime('%s','now')) NOT NULL, --last time user connected
          admin_experience boolean DEFAULT 0 NOT NULL,--Set true if user has ever been administrator
          is_global_admin boolean DEFAULT 0 NOT NULL, -- Set true if user is global admin
          is_guest boolean DEFAULT false NOT NULL --user is a guest and requires approving before is registered (baby backup from Melinda's Backups)
      );`);
      await db.exec(`INSERT INTO 
        old_participant (uid,name,email,password,last_login,admin_experience,is_global_admin, is_guest) 
        SELECT uid,name,email,password,last_login,admin_experience,is_global_admin, is_guest FROM participant`);
      await db.exec('DROP TABLE participant');
      await db.exec(`CREATE TABLE participant(
        uid integer PRIMARY KEY,
        name character varying,
        email character varying,
        password character varying, --stores md5 of password to enable login if doing local authentication
        last_logon bigint DEFAULT(strftime('%s', 'now')) NOT NULL, --last time user connected
        admin_experience boolean DEFAULT 0 NOT NULL, --Set true if user has ever been administrator
        is_global_admin boolean DEFAULT 0 NOT NULL, --Set true if user is global admin
        verification_key character varying, --stores a unique key which the user has to re - enter after reeiving verification e - mail.
        verification_sent bigint DEFAULT(strftime('%s', 'now')) NOT NULL, --time the user was sent a verification e - mail;
        is_verified boolean DEFAULT false NOT NULL, --email has been verified,
        is_registered boolean DEFAULT false NOT NULL--use has been approved
      );`);
      await db.exec(`INSERT INTO 
        participant (uid,name,email,password,last_login,admin_experience,is_global_admin, is_guest) 
        SELECT uid,name,email,password,last_login,admin_experience,is_global_admin, is_guest FROM old_participant`);
      await db.exec(`UPDATE participant SET is_registerd = true, is_verified = true;`); //all particiants so far can be considered registered and verified
      debug('update version');
      await db.exec(`UPDATE settings SET value = 14 WHERE name = 'version';`);
      db.exec('COMMIT');
      debug('foreign keys on');
      await db.exec('PRAGMA foreign_keys = ON;');
      debug('Vacuum');
      await db.exec(`VACUUM;`);
      debug('Completed update to version 14');
    } catch(e) {
      await db.exec('ROLLBACK');
      logger('error', 'SQL Update failed with ' + e.toString());
    }
  };
})();
