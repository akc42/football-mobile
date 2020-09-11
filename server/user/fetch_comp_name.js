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
    const readname = db.prepare(`SELECT name, administrator FROM competition WHERE cid = ?`);
    const checkreg = db.prepare('SELECT count(*) FROM registration WHERE cid = ? AND uid = ?').pluck();
    const readdeadline = db.prepare(`SELECT name, pp_deadline, team_lock, open, closed, administrator FROM competition WHERE cid = ?`);
    const nextCid = db.prepare('SELECT cid FROM competition WHERE cid > ? AND (open = 1 OR open = ?) ORDER BY cid ASC LIMIT 1').pluck();
    const previousCid = db.prepare('SELECT cid FROM competition WHERE cid < ?  AND (open = 1 OR open = ?) ORDER BY cid DESC LIMIT 1').pluck();

      db.transaction(() => {
        let openChk;
        if (params.check) {
          debug('checking')
          const { name, pp_deadline, team_lock, open, closed, administrator } = readdeadline.get(cid);
          openChk = user.global_admin === 1 || administrator === user.uid ? 0 : 1; //reverse of what you might think, look at the query 
          responder.addSection('name', name);
          const reg = checkreg.get(cid, user.uid);
          debug('Registration Counter for us is', reg);
          const cutoff = Math.floor(new Date().getTime() / 1000);
          responder.addSection('canpick', reg > 0 && cutoff < pp_deadline && team_lock === 1 && open === 1 && closed === 0);
        } else {
          const { name, administrator } = readname.get(cid);
          openChk = user.global_admin === 1 || administrator === user.uid ? 0 : 1; //reverse of what you might think, look at the query 
          responder.addSection('name', name);
        }
        debug('get next and previous');
        const next = nextCid.get(cid, openChk);
        debug('next = ', next);
        responder.addSection('next', next === undefined ? 0 : next);
        const previous = previousCid.get(cid, openChk);
        debug('prevous = ', previous);
        responder.addSection('previous', previous === undefined ? 0 : previous);
      })();

    debug('all Done')
  };
})();