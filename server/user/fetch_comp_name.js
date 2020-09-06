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

  const debug = require('debug')('football:api:compname');
  const db = require('../utils/database');

  module.exports = (user,cid,params,responder) => {
    debug('Request received with user', user.uid, 'cid', cid);
    const readname = db.prepare(`SELECT name FROM competition WHERE cid = ?`).pluck();
    const checkreg = db.prepare('SELECT count(*) FROM registration WHERE cid = ? AND uid = ?').pluck();
    const readdeadline = db.prepare(`SELECT name, pp_deadline, team_lock, open, closed FROM competition WHERE cid = ?`);
  
    if(params.check) {
      debug('checking')
      db.transaction(() => {
        const { name, pp_deadline, team_lock, open, closed } = readdeadline.get(cid);
        responder.addSection('name', name);
        const reg = checkreg.get(cid, user.uid);
        debug('Registration Counter for us is', reg);
        const cutoff = Math.floor(new Date().getTime() / 1000);
        responder.addSection('canpick', reg > 0 && cutoff < pp_deadline && team_lock === 1 && open === 1 && closed === 0);
      })();

    } else {
      responder.addSection('name', readname.get(cid));  
    }
    debug('all Done')
  };
})();