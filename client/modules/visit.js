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
import global from './globals.js';

export function manageVisitCookie(initial) {
  const mbvisited = new RegExp(`^(.*; +)?${global.cookieVisitName}=([^;]+)(.*)?$`);
  const matches = document.cookie.match(mbvisited);
  if (matches && matches.length > 2 && typeof matches[2] === 'string') {
    const cookieContents = JSON.parse(matches[2]);
    global.cookieConsent = cookieContents.consent;
    if (initial && cookieContents.cid !== 0) {
      global.cid = 0;
      cookieContents.cid = 0;
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + (90 * 24 * 60 * 60 * 1000))
      document.cookie = `${global.cookieVisitName}=${JSON.stringify(cookieContents)}; expires=${expiryDate.toGMTString()}; Path=/`; 
    } else {
      global.cid = cookieContents.cid;
    }
    return cookieContents.step;
  }
  return false;
}
export function makeVisitCookie(value) {
  const cookieContents = {step: value};
  cookieContents.cid = global.cid;
  cookieContents.consent = global.cookieConsent;
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (90 * 24 * 60 * 60 * 1000))
  document.cookie = `${global.cookieVisitName}=${JSON.stringify(cookieContents)}; expires=${expiryDate.toGMTString()}; Path=/`; 
} 

export function markSeen() {
  const current = manageVisitCookie();
  global.cookieConsent = true;
  
}

export function updateCid(cid) {
  const current = manageVisitCookie();
  global.cid = cid;
  if (current) makeVisitCookie(current);
}