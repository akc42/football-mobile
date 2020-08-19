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

const { SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG } = require('constants');

(function() {
  'use strict';

  const debug = require('debug')('football:api:recaptcha');
  const db = require('../utils/database');
  const secret = db.prepare('SELECT value FROM settings WHERE name = ?').pluck().get('recaptcha_secret');
  const https = require('https');
  const querystring = require('querystring');

  module.exports = async function(params) {
    debug('new request with token', params.token);
    debug('going to use secret', secret);
    return new Promise((accept, reject) => {

      const postData = querystring.stringify({
        'secret': secret,
        'response': params.token
      });

      const options = {
        hostname: 'www.google.com',
        port: 443,
        path: '/recaptcha/api/siteverify',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': postData.length
        }
      };

      const req = https.request(options, (resp) => {
        debug('statusCode:', resp.statusCode);
        debug('headers:', resp.headers);
        let data = '';
        resp.on('data', (chunk) => {
          debug('had a chunk');
          data += chunk;
        });
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          debug('got the resonse data', data);
          accept(JSON.parse(data));
        });

      }).on("error", (err) => {
        debug('error received', err);
        reject(err);
      });
      req.write(postData);
      req.end();
    });
  };
})();