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
(function () {
  'use strict';
  const debug = require('debug')('football:timing');

  const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname, '../server/db-init', 'football.env') });
  const db = require('../server/utils/database');

  debug('test reading via limit')
  for (let i = 0; i < 100000; i++) {
    const byorder = db.prepare('SELECT cid FROM competition WHERE open = 1 ORDER BY cid DESC LIMIT 1').pluck().get()
  }
  debug('finished via limit');
  for (let i = 0; i < 100000; i++) {
    const bymax = db.prepare('SELECT MAX(cid) FROM competition WHERE open = 1').pluck().get()
  }
  debug('finished by max')

})();