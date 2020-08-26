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

(function () {
  'use strict';

  const debug = require('debug')('football:api:competitionupdate');
  const db = require('../utils/database');

  module.exports = async function (user, params, responder) {
    debug('new request from user', user.uid, 'with cid', params.cid);
    const readComp = db.prepare('SELECT cid, name, administrator, open, closed FROM competition WHERE cid = ?');
    const updateAdm = db.prepare('UPDATE competition SET administrator = ? WHERE cid = ?');
    const updateName = db.prepare('UPDATE competition SET name = ? WHERE cid = ?');
    db.transaction(() => {
      if (params.adm !== undefined) updateAdm.run(params.adm, params.cid);
      if (params.name !== undefined) updateName.run(params.name, params.cid);
      responder.addSection('competition', readComp.get(params.cid));
    })();

  };
})();