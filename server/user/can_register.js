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

  const debug = require('debug')('football:api:canregister');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid);
    db.transaction(() => {
      const comp = db.prepare('SELECT open, closed FROM competition WHERE cid = ?').get(cid);
      if (comp.open !== 1) {
        responder.addSection('isOpen', false);
      } else {
        responder.addSection('isOpen', true);
        const registered = db.prepare('SELECT count(*) FROM registration WHERE cid = ? and uid = ?').pluck().get(cid, user.uid);
        if (registered === 0) {
          responder.addSection('isRegisterd', false);
          if (comp.closed === 1) {
            responder.addSection('canRegister', false);
          } else {
            responder.addSection('canRegister', true);
          }

        } else {
          responder.addSection('isRegistered', true);
        }
      }
    })();
  };
})();