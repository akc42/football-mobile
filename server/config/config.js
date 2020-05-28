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

  module.exports = async function(db) {
      await db.exec('BEGIN TRANSACTION')
      const s = await db.prepare('SELECT value FROM settings WHERE name = ?');
      const { value: dcid } = await s.get('default_competition');
      const { value: pointsMap } = await s.get('pointsmap');
      const { value: underdogMap } = await s.get('underdogmap');
      const { value: playoffMap } = await s.get('playoffmap');
      const { value: bonusMap } = await s.get('bonusmap');
      const { value: defaultBonus } = await s.get('defaultbonus');
      const { value: clientLog } = await s.get('client_log');
      const { value: clientLogUid } = await s.get('client_log_uid');
      const { value: cookieName } = await s.get('cookie_name');
      const { value: cookieVisitName } = await s.get('cookie_visit_name');
      const { value: mainMenuIcon } = await s.get('main_menu_icon');
      await s.finalize();
      const extras = {};
      const rowc = await db.get(`SELECT cid, administrator FROM competition ORDER BY cid DESC LIMIT 1`);
      if (rowc !== undefined) {
        debug('rowc found ', rowc);
        extras.lcid = rowc.cid;
        extras.luid = rowc.administrator;
      } else {
        debug('rowc undefined');
        extras.lcid = 0;
        extras.luid = 0;
      }
      const rowr = await db.get(`SELECT rid FROM round WHERE cid = ? ORDER BY rid DESC LIMIT 1`, dcid);
      if (rowr !== undefined) {
        debug('rowr found', rowr);
        extras.drid = rowr.rid;
      } else {
        debug('rowr undefined');
        extras.drid = 0;
      }
      await db.exec('COMMIT');
      const { version, year } = await versionPromise;
      const config = {
        dcid:dcid,
        pointsMap:pointsMap, 
        underdogMap:underdogMap, 
        playoffMap: playoffMap, 
        bonusMap: bonusMap, 
        defaultBonus: defaultBonus, 
        clientLog: clientLog, 
        clientLogUid: clientLogUid,
        version: version,
        copyrightYear: year,
        cookieName: cookieName,
        cookieVisitName: cookieVisitName,
        mainMenuIcon: mainMenuIcon,
        ...extras
      };
      debug('Success config');
      return config;

  };
})();