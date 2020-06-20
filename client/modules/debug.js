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
import global from './globals.js';
import {manageVisitCookie} from './visit.js';

let topics = '';
let debugEnabled = false;
let limitedUser = 0;
global.ready.then(() => {
  if (global.clientLog.length > 0) {
    limitedUser = global.clientLogUid;
    topics = global.clientLog;
    debugEnabled = true;
  }

});

export default function(t) {
  if (typeof t !== 'string' || t.length === 0) {
    console.error('Debug requires topic which is a non zero length string which is not "ALL"',t, 'Received');
    throw new Error('Debug requires a non zero length string which is not "ALL"'); 
  }
  const topic = `:${t}:`;
  let timestamp = new Date().getTime();
  return function(message) {
    if (debugEnabled && (topics === 'ALL' || topics.indexOf(topic) >=0) && (limitedUser === 0 || global.user.uid === limitedUser)) {
      const now = new Date().getTime();
      const gap = now - timestamp;
      timestamp = now;
      const cookie = manageVisitCookie();
      if (cookie) api('session/log',{topic:topic, message: message, gap: gap}); //no interest in reply
    }
  }
}