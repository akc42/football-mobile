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

  const debug = require('debug')('football:api:recaptcha');
  const db = require('../utils/database');
  const secret = db.prepare('SELECT value FROM settings WHERE name = ?').pluck().get('recaptcha_secret');
  const https = require('https');


  module.exports = async function(params) {
    debug('new request with token', params.token);
    return new Promise((accept, reject) => {
      https.request(`https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${params.token}`,{
        method: 'POST',
      }, (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
          data += chunk;
        });
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          accept(JSON.parse(data));
        });

      }).on("error", (err) => {
        reject(err);
      });
    });
  };
})();