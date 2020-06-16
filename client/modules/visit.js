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

export function manageVisitCookie() {
  const mbvisited = new RegExp(`^(.*; +)?${global.cookieVisitName}=([^;]+)(.*)?$`);
  const matches = document.cookie.match(mbvisited);
  if (matches && matches.length > 2 && typeof matches[2] === 'string') {
    if (matches[2].slice(-1) === '%') {
      global.cookieConsent = true;
      //loose global consent marker if its there.
      matches[2] = matches[2].slice(0, -1);
    }
    return matches[2];
  }
  return false;
}
export function makeVisitCookie(value) {
  let content = value;
  if (global.cookieConsent) content += '%';
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (90 * 24 * 60 * 60 * 1000))
  document.cookie = `${global.cookieVisitName}=${content}; expires=${expiryDate.toGMTString()}; Path=/`; 
} 

export function markSeen() {
  const current = manageVisitCookie();
  global.cookieConsent = true;
  if (current) makeVisitCookie(current);
}