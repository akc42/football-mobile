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
const api = /^\/api\/(service|config|session|profile|approve|gadm)\/(\w+)|(\d+)\/(admin|user)\/(\w+)$/i;
self.addEventListener('install', (event) => 
  event.waitUntil(caches.open(version).then( cache => cache.addAll([
    '/',
    '/index.html',
    '/style.css',
    '/images/hephaestus.png',
    '/images/mb-logo.png',
    '/appimages/football-logo-32x32.png',
    '/appimages/football-logo-128x128.png',
    '/appimages/football-logo.svg',
    '/appimages/signature.png',
    '/appimages/site_logo.png',
    '/manifest.json',
    '/favicon.ico',
    '/robots.txt',
    '/elements/admin-conf-div.js',
    '/elements/admin-email.js',
    '/elements/admin-help.js',
    '/elements/admin-home.js',
    '/elements/admin-manager.js',
    '/elements/admin-match.js',
    '/elements/admin-round-home.js',
    '/elements/admin-round-round-home.js',
    '/elements/admin-round-round.js',
    '/elements/admin-round-round-match.js',
    '/elements/admin-rounds.js',
    '/elements/admin-teams.js',
    '/elements/approve-email.js',
    '/elements/approve-home.js',
    '/elements/approve-manager.js',
    '/elements/calendar-dialog.js',
    '/elements/calendar-input.js',
    '/elements/comment-button.js',
    '/elements/comment-dialog.js',
    '/elements/comment-panel.js',
    '/elements/conf-div.js',
    '/elements/date-format.js',
    '/elements/delete-dialog.js',
    '/elements/dialog-box.js',
    '/elements/dialog-polyfill.js',
    '/elements/emoji-button.js',
    '/elements/emoji-dialogr.js',
    '/elements/error-manager.js',
    '/elements/fm-checkbox.js',
    '/elements/fm-input.js',
    '/elements/fm-page.js',
    '/elements/football-page.js',
    '/elements/form-manager.js',
    '/elements/gadm-email.js',
    '/elements/gadm-home.js',
    '/elements/gadm-manager.js',
    '/elements/gadm-promote.js',
    '/elements/home-manager.js',
    '/elements/icon-manager.js',
    '/elements/main-app.js',
    '/elements/match-conf-div.js',
    '/elements/material-icon.js',
    '/elements/navref-manager.js',
    '/elements/page-manager.js',
    '/elements/pick-conf-div.js',
    '/elements/profile-manager.js',
    '/elements/re-captcha.js',
    '/elements/register-manager.js',
    '/elements/round-header.js',
    '/elements/round-match.js',
    '/elements/rounds-home.js',
    '/elements/rounds-manager.js',
    '/elements/rounds-user.js',
    '/elements/route-manager.js',
    '/elements/scores-manager.js',
    '/elements/session-approve.js',
    '/elements/session-email.js',
    '/elements/session-expired.js',
    '/elements/session-forgotten.js',
    '/elements/session-manager.js',
    '/elements/session-member.js',
    '/elements/session-mempass.js',
    '/elements/session-mprocess.js',
    '/elements/session-password.js',
    '/elements/session-pin.js',
    '/elements/session-private.js',
    '/elements/session-toomany.js',
    '/elements/session-welcome.js',
    '/elements/soon-manager.js',
    '/elements/teams-home.js',
    '/elements/teams-manager.js',
    '/elements/teams-user.js',
    '/elements/user-match.js',
    '/elements/user-page.js',
    '/elements/user-pick.js',
    '/elements/waiting-indicator.js',
    '/appimages/teams/ARI.png',
    '/appimages/teams/ATL.png',
    '/appimages/teams/BAL.png',
    '/appimages/teams/BUF.png',
    '/appimages/teams/CAR.png',
    '/appimages/teams/CHI.png',
    '/appimages/teams/CIN.png',
    '/appimages/teams/CLE.png',
    '/appimages/teams/DAL.png',
    '/appimages/teams/DEN.png',
    '/appimages/teams/DET.png',
    '/appimages/teams/GB.png',
    '/appimages/teams/HOU.png',
    '/appimages/teams/IND.png',
    '/appimages/teams/JAC.png',
    '/appimages/teams/KC.png',
    '/appimages/teams/LAC.png',
    '/appimages/teams/LAR.png',
    '/appimages/teams/MIA.png',
    '/appimages/teams/MIN.png',
    '/appimages/teams/NE.png',
    '/appimages/teams/NO.png',
    '/appimages/teams/NYG.png',
    '/appimages/teams/NYJ.png',
    '/appimages/teams/OAK.png',
    '/appimages/teams/PHI.png',
    '/appimages/teams/PIT.png',
    '/appimages/teams/SD.png',
    '/appimages/teams/SEA.png',
    '/appimages/teams/SF.png',
    '/appimages/teams/STL.png',
    '/appimages/teams/TB.png',
    '/appimages/teams/TEN.png',
    '/appimages/teams/WAS.png',
    '/fonts/NotoColorEmoji.ttf',
    '/libs/cache.js',
    '/libs/class-map.js',
    '/libs/guard.js',
    '/libs/if-defined.js',
    '/libs/lit-element.js',
    '/libs/lit-html-f17e05ab.js',
    '/libs/lit-html.js',
    '/libs/style-map.js',
    '/libs/unsafe-html.js',
    '/libs/webcomponents-loader.js',
    '/modules/api.js',
    '/modules/debug.js',
    '/modules/events.js',
    '/modules/globals.js',
    '/modules/host.js',
    '/modules/keys.js',
    '/modules/location.js',
    '/modules/route.js',
    '/modules/utils.js',
    '/styles/button.js',
    '/styles/emoji.js',
    '/styles/error.js',
    '/styles/opids.js',
    '/styles/page.js',
    '/styles/tooltip.js'



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
    //We have an api call, so deal with it appropriately (mostly nothing, just service)
    if (/^\/api\/service\//i.test(requestURL.pathname)) {
      //special request to service worker. So we MUST respond, server would fail on this.
      if (/^\/api\/service\/tab/i.test(requestURL.pathname)) {
        event.respondWith(
          self.clients.matchAll({includeUncontrolled: true}).then(clients => new Response(clients.length.toString(),{status: 200, headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/plain; charset=US-ASCII',
            } })));
      } else {
        event.respondWith(new Response('', { status: 404 }));//unknown so send a 404
      }
    } 
  } else if(event.request.url.startsWith(self.location.origin)) {
    //This is all our static stuff, we should use the cache, but background fetch to update
    event.respondWith(
      caches.open(version).then(cache => cache.match(event.request).then(response => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }).catch(() => true); //silently ignore network problems.
        return response || fetchPromise;
      }))

    );  
  }
});

