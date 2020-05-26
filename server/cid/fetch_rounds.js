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

  module.exports = async (user,cid, params,dbOpen,responder) => {
    db = await dbOpen();
    await db.exec('BEGIN TRANSACTION');
    const rounds = await db.all(`SELECT round, name, open FROM round WHERE cid = ? ORDER BY rid DESC`, cid);
    responder.addSection('rounds', rounds);
    const {timestamp} = await db.get(`SELECT MAX(update_date) as timestamp FROM round WHERE cid = ?`,cid);
    responder.addSection('timestamp', timestamp);
    await db.exec('COMMIT'); //trivially faster to do this 
  };
})();