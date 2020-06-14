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
  const db = require('../utils/database');

  module.exports = async function() {
      const config = {};
      const s = db.prepare('SELECT value FROM settings WHERE name = ?').pluck();
      const topc = db.prepare(`SELECT cid, administrator FROM competition ORDER BY cid DESC LIMIT 1`);
      const rounds = db.prepare(`SELECT rid FROM round WHERE cid = ? ORDER BY rid DESC LIMIT 1`).pluck();
      db.transaction(() => {
        debug('About to Read Settings Values');
        
        config.dcid = s.get('default_competition');
        config.pointsMap = s.get('pointsmap');
        config.underdogMap = s.get('underdogmap');
        config.playoffMap = s.get('playoffmap');
        config.bonusMap = s.get('bonusmap');
        config.defaultBonus = s.get('defaultbonus');
        config.clientLog = s.get('client_log');
        config.clientLogUid = s.get('client_log_uid');
        config.cookieName = s.get('cookie_name');
        config.cookieVisitName = s.get('cookie_visit_name');
        config.mainMenuIcon = s.get('main_menu_icon');
        config.webmaster = s.get('webmaster');
        config.siteLogo = s.get('site_logo');
        config.verifyExpires = s.get('verify_expires');
        config.firstTimeMessage = s.get('first_time_message');
        config.minPassLen = s.get('min_pass_len');
   
        
        const rowc = topc.get();
        if (rowc !== undefined) {
          debug('rowc found ', rowc);
          config.lcid = rowc.cid;
          config.luid = rowc.administrator;
        } else {
          debug('rowc undefined');
          config.lcid = 0;
          config.luid = 0;
        }
        const rowr = rounds.get(config.dcid);
        if (rowr !== undefined) {
          debug('rowr found', rowr);
          config.drid = rowr.rid;
        } else {
          debug('rowr undefined');
          config.drid = 0;
        }

      })();

      const { version, year } = await versionPromise;
      config.version = version;
      config.copyrightYear = year;
      debug('Success config');
      
      return config;

  };
})();