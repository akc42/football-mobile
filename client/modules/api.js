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


import { ApiError, StorageError } from "./events.js";
import global from '../modules/globals.js';


export default async function api(url, params, signal) {
  const token = sessionStorage.getItem('token');
  const body = params || {};
  //make a key of users uid and params, change name as could be overwridden if in params (admin on behalf of someone). 
  const keyurl = '/api/' + url;
  const key = JSON.stringify({ ...body, kuid: global.user.uid }) + '$.' + keyurl ; 
  if (token !== null) body.token = token;
  const options = {
    credentials: 'same-origin',
    method: 'post',
    headers: new Headers({
      'content-type': 'application/json'
    }),
    body: JSON.stringify(body)
  };
  if (signal) options.signal = signal;
  let text;
  try {
    const response = await window.fetch('/api/' + url, options);
    if (!response.ok) {

      throw new ApiError(response.status);
    } 
    text = await response.text();
    const result = JSON.parse(text); 
    if (sessionStorage.getItem('setOfflineAge') === null) {
      sessionStorage.setItem('setOfflineAge', 'done');
      localStorage.setItem('offlineAge', Math.floor(Date.now()/1000)); //in seconds
    }
    localStorage.setItem(key, text);  //save our response in case needed for offline
    return result;
  } catch (err) {
    if (err.type === 'api-error') throw err; //just 

    if (text !== undefined && text.length > 5) {
      //we failed to parse the json - the actual code should be in the text near the end;
      throw new ApiError(parseInt(text.substr(-6,3),10));
    }
    //Assume network Error, See if we can use local storage
    const lastStore = localStorage.getItem('offlineAge');
    const offlineCacheAge = parseInt(localStorage.getItem('offlineCacheAge'),10) * 3600;
    if (lastStore !== null) {
      if (parseInt(lastStore,10) + offlineCacheAge > Math.floor(Date.now()/1000) ) {
        //cache is still valid, lets see if we have the item
        const item = localStorage.getItem(key);
        if (item !== null) {
          return JSON.parse(item);
        }
      }
    }
    // we must not have the item and in date, so throw
    throw new StorageError(keyurl);
  }
  

}
