/**
    @licence
    Copyright (c) 2018 Alan Chandler, all rights reserved

    This file is part of PASv5, an implementation of the Patient Administration
    System used to support Accuvision's Laser Eye Clinics.

    PASv5 is licenced to Accuvision (and its successors in interest) free of royality payments
    and in perpetuity in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
    implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. Accuvision
    may modify, or employ an outside party to modify, any of the software provided that
    this modified software is only used as part of Accuvision's internal business processes.

    The software may be run on either Accuvision's own computers or on external computing
    facilities provided by a third party, provided that the software remains soley for use
    by Accuvision (or by potential or existing customers in interacting with Accuvision).
*/
let routeCallback = null;
let lastChangedAt;
let route;
import global from './globals.js';
import {AuthChanged} from './events.js';

export function connectUrl(callback) {
  routeCallback = callback;
  window.addEventListener('hashchange',urlChanged);
  window.addEventListener('popstate', urlChanged);
  window.addEventListener('location-altered',urlChanged);
  window.addEventListener('route-updated', routeUpdated);
  Promise.resolve().then(() => {
    urlChanged();
    lastChangedAt = window.performance.now() - (global.dwellTime - 200); //first time we need to adjust for dwell time
  });

}
export function disconnectUrl() {
  routeCallback = null;
  window.removeEventListener('hashchange',urlChanged);
  window.removeEventListener('popstate', urlChanged);
  window.removeEventListener('location-altered',urlChanged);
  window.removeEventListener('route-updated', routeUpdated);
}

function urlChanged() {
  let path = window.decodeURIComponent(window.location.pathname);
  const slashIndex = path.lastIndexOf('/');
  if (path.substring(slashIndex + 1).indexOf('.') >= 0) {
    //we have a '.' in the last part of the path, so cut off this segment
    path = slashIndex < 0 ? '/' : path.substring(0,slashIndex);
  } 
  const query = decodeParams(window.location.search.substring(1));
  if (route && route.path ===  path && route.query === query) return;
  lastChangedAt = window.performance.now();
  const mbball = new RegExp(`^(.*; +)?${global.cookieName}=([^;]+)(.*)?$`);
  route = {
    path: mbball.test(document.cookie) ? path : '/',
    segment: 0,
    params: {},
    query: query,
    active: true
  };

  if (routeCallback) routeCallback(route);
  
  if (!mbball.test(document.cookie)) window.dispatchEvent(new AuthChanged(false));
}
function routeUpdated(e) {
  let newPath = route.path;
  if(e.detail.path !== undefined) {
    if (Number.isInteger(e.detail.segment)) {
      let segments = route.path.split('/');
      if (segments[0] === '') segments.shift(); //loose leeding
      if(segments.length < e.detail.segment) {
        throw new Error('routeUpdated with a segment longer than current route');
      }
      if(segments.length > e.detail.segment) segments.length = e.detail.segment; //truncate to just before path
      if (e.detail.path.length > 1) {
        const newPaths = e.detail.path.split('/');
        if (newPaths[0] === '') newPaths.shift(); //ignore blank if first char of path is '/'
        segments = segments.concat(newPaths);
      }
      newPath = '/' + segments.join('/');
      //lose trailing slash if not just a single '/'
      if (newPath.slice(-1)  === '/' && newPath.length > 1) newPath = newPath.slice(0,-1);
    } else {
      throw new Error('Invalid segment info in route-updated event');
    }
  }
  let query = Object.assign({}, route.query);
  if (e.detail.query !== undefined) {
    query = e.detail.query;
  }
  let newUrl = window.encodeURI(newPath).replace(/#/g, '%23').replace(/\?/g, '%3F');
  if (Object.keys(query).length > 0) {
    newUrl += '?' + encodeParams(query)
      .replace(/%3F/g, '?')
      .replace(/%2F/g, '/')
      .replace(/'/g, '%27')
      .replace(/#/g, '%23')
    ;

  }
  newUrl += window.location.hash;
  // Tidy up if base tag in header
  const fullUrl = new URL(newUrl, window.location.protocol + '//' + window.location.host).href;
  if (fullUrl !== window.location.href) { //has it changed?
    let now = window.performance.now();
    if (lastChangedAt + global.dwellTime > now) {
      window.history.replaceState({}, '', fullUrl);
    } else {
      window.history.pushState({}, '', fullUrl);
    }
    urlChanged();
  }
}
function encodeParams(params) {
  const encodedParams = [];

  for (let key in params) {
    const value = params[key];
    if (value === '') {
      encodedParams.push(encodeURIComponent(key) + '=');
    } else  {
      encodedParams.push(
        encodeURIComponent(key) + '=' +
        encodeURIComponent(value.toString()));
    }
  }
  return encodedParams.join('&');
}
function decodeParams(paramString) {
  var params = {};
  // Work around a bug in decodeURIComponent where + is not
  // converted to spaces:
  paramString = (paramString || '').replace(/\+/g, '%20');
  var paramList = paramString.split('&');
  for (var i = 0; i < paramList.length; i++) {
    var param = paramList[i].split('=');
    if (param.length === 2) {
      let value;
      try {
        value = decodeURIComponent(param[1]);
        if (value === 'true') {
          value = true;
        } else if (value === 'false') {
          value = false;
        } else if (/^-?\d+$/.test(value)) {
          value = parseInt(value,10);
        }
      } catch (e) {
        value = '';
      }
      params[decodeURIComponent(param[0])] = value;
    }
  }
  return params;
}

