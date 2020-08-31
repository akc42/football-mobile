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
  const db = require('../utils/database');

  module.exports = (user,cid,params,responder) => {
    const readname = db.prepare(`SELECT name FROM competition WHERE cid = ?`).pluck();
    const readdeadline = db.prepare(`SELECT name, pp_deadline, team_lock FROM competition WHERE cid = ?`);
  
    if(params.check) {
      const {name, pp_deadline, team_lock} = readdeadline.get(cid);
      responder.addSection('name', name);
      const cutoff = Math.floor(new Date().getTime()/1000);
      responder.addSection('canpick', cutoff < pp_deadline && team_lock === 1);
    } else {
      responder.addSection('name', readname.get(cid));  
    }
  };
})();