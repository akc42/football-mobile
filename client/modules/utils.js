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
import {LocationAltered} from './events.js';

export function generateUri(path, params) {
  var str = [];
  if (params) {
    for (var param in params) {
      //eslint-disable-next-line no-prototype-builtins
      if (params.hasOwnProperty(param)) {
        str.push(encodeURIComponent(param) + '=' + encodeURIComponent(params[param]));
      }
    }
    if (str.length > 0) {
      return path + '?' + str.join('&');
    }
  }
  return path;
}
export function openPdf(path, params) {
  window.open(
    '/api/' + generateUri(path,params),
    '_blank',
    'chrome=yes,centerscreen,resizable,scrollbars,status,height=800,width=800');
}
export function switchPath(path, params) {
  history.pushState({}, null, generateUri(path,params));
  window.dispatchEvent(new LocationAltered());
}


