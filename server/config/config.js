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

  const debug = require('debug')('football:api:config');
  const versionPromise = require('../version');

  module.exports = async function(dbOpen) {
    const config = {
      pointsMap: JSON.parse(process.env.FOOTBALL_POINTS_MAP),
      underdogMap: JSON.parse(process.env.FOOTBALL_UNDERDOG_MAP),
      playoffMap: JSON.parse(process.env.FOOTBALL_PLAYOFF_MAP),
      bonusMap: JSON.parse(process.env.FOOTBALL_POINTS_MAP),
      defaultBonus:parseInt(process.env.FOOTBALL_DEFAULT_BONUS,10)
    }
    db = await dbOpen();
    await db.exec('BEGIN TRANSACTION')
    const { value: dcid } = await db.get(`SELECT value FROM settings WHERE name = 'default_competition'`);
    const {rid: drid} = await db.get(`SELECT rid FROM round WHERE cid = ? ORDER BY rid DESC LIMIT 1`, dcid);
    config.dcid = dcid;
    config.drid = drid;
    //get the very latest competition 
    const {cid: lcid, administrator} = await db.get(`SELECT cid, administrator FROM competition ORDER BY cid DESC LIMIT 1`);
    config.lcid = lcid;
    config.luid = administrator;
    await db.exec('ROLLBACK');
   db.close();
    const {version, year} = await versionPromise;
    config.version = version;
    config.copyrightYear = year;
    debug('Success config');
    return config;
    
  };
})();