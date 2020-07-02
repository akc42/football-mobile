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
  const db = require('../utils/database');

  module.exports = () => {
    return db.prepare(`SELECT  c.cid, c.name, c.open, c.administrator, CASE WHEN r.rid IS NULL THEN 0 ELSE r.rid END AS rid 
        FROM competition c LEFT JOIN round r ON r.cid = c.cid AND r.rid = (
          SELECT rid FROM round WHERE open = 1 AND cid = c.cid ORDER BY rid DESC LIMIT 1
        ) ORDER BY c.cid DESC;`).all();
  };
})();