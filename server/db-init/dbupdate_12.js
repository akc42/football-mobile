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
    debug('alter round');
    await db.exec(`ALTER TABLE round ADD bvalue smallint DEFAULT 2 NOT NULL;`);

    await db.exec(`UPDATE round SET bvalue = 1 WHERE cid <> 11;`)
    await db.exec(`UPDATE round SET results_cache = NULL;`);
    await db.exec(`UPDATE competition SET results_cache = NULL WHERE cid = 11;`);


    debug('alter bonus score view');
    await db.exec(`DROP VIEW bonus_score;`);
    await db.exec(`CREATE VIEW bonus_score AS
      SELECT r.cid, r.rid, u.uid, (CASE WHEN p.uid IS NULL THEN 0 ELSE 1 END * r.bvalue) AS score
      FROM((registration u JOIN round r USING(cid))
      LEFT JOIN option_pick p ON((((p.cid = r.cid) AND(p.rid = r.rid) AND(p.uid = u.uid) AND(p.opid = r.answer)) AND(r.valid_question = 1))))
      WHERE r.open = 1;`);

    debug('Update Settings')
    await db.exec(`INSERT INTO settings(name, value) VALUES('bonusmap', '[1,2,4,6,8,12,16]');`); //map of bonus question points slider position to points allocated
    await db.exec(`INSERT INTO settings(name, value) VALUES('defaultbonus', 2);`); //default value of question bonus when new round created

    await db.exec(`UPDATE settings SET value = '/inc/template.inc' WHERE name = 'template';`);
    await db.exec(`UPDATE settings SET value = './img/emoticons' WHERE name = 'emoticon_dir';`);
    await db.exec(`UPDATE settings SET value = 'img/emoticons' WHERE name = 'emoticon_url';`);

    await db.exec(`UPDATE settings SET value = 13 WHERE name = 'version';`);
    debug('Vacuum');
    await db.exec(`VACUUM;`);
    debug('Completed update to version 13');

  };
})();
