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

/*
  This module is not as straight forwards as it might sound.  That is because
  instead of just returning the result of 

  SELECT u.uid, u.name FROM participant u JOIN registration r USING (uid)
  WHERE  r.cid = ? 

  we want to return the list of users according to their overall position in the
  competition.  This of course is a complex query.  So much so that the database
  has a cache of results at the competition level, and provided the cache is not
  expired by the cache_age parameter in settings we can use it.  However if its not
  set or has expired we need to rebuild it.  

  Note - the round level results_cache is a much more complex object and is not
  used in this context, but holds details of match results and picks as well as the score
  calculation.  So we will not be using it

*/

(function() {
  'use strict';

  const debug = require('debug')('football:api:users_summary');
  const getCache = require('../utils/competition_cache');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, ' for cid', cid);
    const cache = getCache(cid);
    //extract the data we want from the cache
    responder.addSection('users');
    for (const user of cache) {
      const {rounds, ...row} = user;
      responder.write(row);
      debug('written row ', row);
    }
    debug('all done');
  };
})();