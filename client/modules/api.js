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


import { ApiError, LogoffRequest, LocationAltered } from "./events.js";

export default function api(url, params, signal) {
  const options = {
    credentials: 'same-origin',
    method: 'post',
    headers: new Headers({
      'content-type': 'application/json'
    }),
    body: JSON.stringify(params)
  };
  if (signal) options.signal = signal;
  return window.fetch('/api/' + url, options).then(response => {
    if (!response.ok ) {
      //put us back to home
      window.history.pushState({}, null, '/');
      window.dispatchEvent(new LocationAltered());
      if (response.status === 403) {
        //unauthorised so log off, but then do no more
        window.dispatchEvent(new LogoffRequest());
      } 
      return {status: false, reason: `fetch returned response code ${response.status}`};
    } else {
      return response.json();
    }
  }).then(response => {
    if (!response.status) {
      console.warn('api call failed with', response.reason);
      window.dispatchEvent(new ApiError());
      delete response.reason;
    }
    delete response.status;
    return response;
  });
}
