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


import { ApiError } from "./events.js";

export default async function api(url, params, signal) {
  const options = {
    credentials: 'same-origin',
    method: 'post',
    headers: new Headers({
      'content-type': 'application/json'
    }),
    body: JSON.stringify(params)
  };
  if (signal) options.signal = signal;
  let text;
  try {
    const response = await window.fetch('/api/' + url, options);
    if (!response.ok) throw new ApiError(response.status); 
    text = await response.text();
    return JSON.parse(text);
  } catch (err) {
    if (err.type === 'api-error') throw err; //just 
      //we failed to parse the json - the actual code should be in the text near the end;
    throw new ApiError(parseInt(text.substr(-6,3),10));    

  }
  

}
