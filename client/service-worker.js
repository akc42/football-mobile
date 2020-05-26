/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file is part of Football Mobile.

    Football-Mobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Football-Mobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Football-Mobile.  If not, see <http://www.gnu.org/licenses/>.
*/
const version = 'fm-v1'
const api = /^\/api\/(status)|((\w+)\/(volume|timer|done|log|warn|token|((\S+)\/(take|start|renew|release|stop))))$/i;
self.addEventListener('install', (event) => 
  event.waitUntil(caches.open(version).then( cache => cache.addAll([
    '/',
    '/index.html',
    '/images/light-aluminium.png',
    '/images/football-logo-32x32.png',
    '/images/football-logo-144x144.png',
    '/images/football-logo.svg',
    '/manifest.json',
    '/favicon.ico',
    '/robots.txt',
    '/elements/material-icon.js'

  ])))
);
self.addEventListener('activate', (event) => {
  event.waitUntil(async function() {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.filter((cacheName) => {
        return cacheName !== version;  //deletes anything that isn't current 
      }).map(cacheName => caches.delete(cacheName))
    );
  });
});


self.addEventListener('fetch', (event) => {
  const requestURL = new URL(event.request.url);
  if (/^\/api\//i.test(requestURL.pathname)) {
    const matches = api.exec(requestURL.pathname);
    if (matches[1] === 'status') {
      //do nothing - let the browser handle it
    } else {
      switch (matches[4]) {
        case 'volume':
          break;  //do nothing at all, let brower handle it entirely
        case 'log':
        case 'warn':
          event.respondWith(fetch(event.request).then(response=>response).catch(() => new Response('',{status:200})));//pass through if can else just pretend it was OK 
          break;
        default:
          //normally let the brower respond, but if it can't for some reason (like its offline) send a {state: false} response
          event.respondWith(
            fetch(event.request).then(response => response).catch(() => new Response(JSON.stringify({state: false},{status:200, headers: {
              'Cache-Control': 'no-cache',
              'Content-Type': 'application/json'
            }})))
          );
      }
    }
  } else {
    event.respondWith(
      fetch(event.request).then(response => {
        const responseClone = response.clone();
        caches.open(version).then(cache => cache.put(event.request, responseClone));
        return response;
      }).catch(() => caches.open(version).then(cache => cache.match(event.request)))
    );
  }
});

