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

  const debug = require('debug')('football:api:verify');

  module.exports = async function(headers, params, db, responder) {
    const result = await db.get(
      'SELECT * FROM participant WHERE email = ? OR (waiting_email AND pending_email = ?);',
      [params.email,params.email]
    );
    if (result === undefined) {
      debug('no record found');
      responder.addSection('state','notfound');
    } else {
      debug('record found');
      responder.addSection('state', 'found');
      const response = { //hide sensitive data just make them booleans
        ...result, 
        password: !!result.password, 
        verification_key: !!result.verification_key 
      }; 
      debug('responding with ', response);
      responder.addSection('user', response);
    } 
    
    debug('Success verify');
  };
})();