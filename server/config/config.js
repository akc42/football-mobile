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
  const versionPromise = require('../utils/version');
  const db = require('../utils/database');

  module.exports = async function() {
      const config = {};
      const s = db.prepare('SELECT value FROM settings WHERE name = ?').pluck();
      const last = db.prepare(`SELECT c.cid, c.administrator, CASE WHEN r.rid IS NULL THEN 0 ELSE r.rid END AS rid, c.gap 
        FROM competition c LEFT JOIN round r ON  r.cid = c.cid AND r.rid = (
          SELECT rid FROM round WHERE cid = c.cid AND r.open = 1 ORDER BY rid DESC LIMIT 1
        ) ORDER BY c.
        cid DESC LIMIT 1`);
      db.transaction(() => {
        debug('About to Read Settings Values');      
        config.clientLog = s.get('client_log');
        config.clientLogUid = s.get('client_log_uid');
        config.cookieName = s.get('cookie_name');
        config.webmaster = s.get('webmaster');
        config.siteLogo = s.get('site_logo');
        config.verifyExpires = s.get('verify_expires');
        config.rateLimit = s.get('rate_limit');
        config.minPassLen = s.get('min_pass_len');
        config.dwellTime = s.get('dwell_time');
        config.reCaptchaKey = s.get('recaptcha_key');
        config.organisationName = s.get('organisation_name');
        config.comingSoonMessage = s.get('coming_soon_message');
        config.membershipRate = s.get('membership_rate');
        config.maxMembership = s.get('max_membership');

        const row = last.get();
        config.lcid = row.cid;
        config.luid = row.administrator;
        config.lrid = row.rid;
        config.lgap = row.gap;
      })();

      const { version, year } = await versionPromise;
      config.version = version;
      config.copyrightYear = year;
      debug('Success config');
      
      return JSON.stringify(config);

  };
})();