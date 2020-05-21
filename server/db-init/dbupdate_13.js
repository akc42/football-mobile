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
    debug('update participant table');
    await db.exec(`ALTER TABLE participant ADD is_registered boolean DEFAULT false NOT NULL;`);
    await db.exec(`ALTER TABLE participant ADD is_verified boolean DEFAULT false NOT NULL;`);
    await db.exec(`ALTER TABLE participant ADD verification_key character varying;`);
    await db.exec(`ALTER TABLE participant ADD verification_sent bigint DEFAULT(strftime('%s', 'now')) NOT NULL;`);
    await db.exec(`UPDATE participant SET is_registerd = true, is_verified = true;`); //all particiants so far can be considered registered and verified
    debug('update version');
    await db.exec(`UPDATE settings SET value = 14 WHERE name = 'version';`);

    debug('Vacuum');
    await db.exec(`VACUUM;`);
    debug('Completed update to version 14');

  };
})();
