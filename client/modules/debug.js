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
import api from './api.js';
import config from './config.js';
import user from './user.js';

let topics = '';
let debugEnabled = false;
let limitedUser = 0;
config().then(conf => {
  if (conf.server && conf.clientLog.length > 0) {
    limitedUser = conf.clientLogUid;
    topics = conf.clientLog;
    debugEnabled = true;
  }

});

export default function(t) {
  if (typeof t !== 'string' || t.length === 0) {
    console.error('Debug requires topic which is a non zero length string which is not "ALL"',t, 'Recieved')
    throw new Error('Debug requires a non zero length string which is not "ALL"'); 
  }
  const topic = t;

  return function(message) {
    if (debugEnabled && (topics === 'ALL' || topics.indexOf(topic) >=0) && (limitedUser === 0 || user.uid === limitedUser)) { 
      api('session/log',{topic:topic, message: message}); //no interest in reply
    }
  }
}