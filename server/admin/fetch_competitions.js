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

/*
  this is a dummy file, do not remove unless there is at least one other real file in the directory
*/

(function () {
  'use strict';
  const db = require('../utils/database');

  module.exports = (user,params,responder) => {

    db.transaction(() => {
      const competitions = db.prepare(`SELECT cid, name, open FROM competition ORDER BY cid DESC`).all();
      responder.addSection('competitions', competitions);
      const timestamp = db.prepare(`SELECT MAX(update_date) as timestamp FROM competition`).pluck().get();
      responder.addSection('timestamp', timestamp);    
    })();

  };
})();