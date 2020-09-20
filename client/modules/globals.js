/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file is part of football mobile.

    football mobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    football mobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with football mobile.  If not, see <http://www.gnu.org/licenses/>.
*/
import {ApiError} from './events.js';

const firstTabPromise = new Promise(resolve => {
  const ft = sessionStorage.getItem('firstTab');
  if (ft !== null) {
    resolve(ft);
  } else {
    window.fetch('/api/service/tab', { method: 'get' })
      .then(response => response.text()).then(text => {
        if (text === '1') {
          resolve('true');
        } else {
          resolve('false');
        }
      }).catch(() => {
        const tabId = Date.now();
        const timer = setTimeout(() => {
          resolve('true');
        }, 70);
        const storageEventHandler = (e) => {
          if (e.key === 'pageOpen') {
            localStorage.setItem('pageAvailable', tabId);
          }
          if (e.key === 'pageAvailable') {
            clearTimeout(timer);
            resolve('false');
          }
        };
        window.addEventListener('storage', storageEventHandler);
        const unloadHandler = () => {
          window.removeEventListener('storage', storageEventHandler);
          window.removeEventListener('unload', unloadHandler);
        };
        window.addEventListener('unload', unloadHandler)        
      });
  }

}).then(ft => {
  sessionStorage.setItem('firstTab', ft);
  if (ft === 'true') {
    //lets see if we have a token with our credentials to use
    let token = localStorage.getItem('token');
    if (token !== null) {
      sessionStorage.setItem('token', token);
    }
  }
});
const configPromise = new Promise(resolve => {
  window.fetch('/api/config/config', { method: 'get' }).then(response => response.text()).then(text => {
    try {
      return JSON.parse(text);
    } catch (err) {
      //we failed to parse the json - the actual code should be in the text near the end;
      throw new ApiError(parseInt(text.substr(-6, 3), 10));
    }
  }).then(conf => { //most like just update values.
    localStorage.setItem('clientLog', conf.clientLog);
    localStorage.setItem('clientLogUid', conf.clientLogUid);
    localStorage.setItem('version', conf.version);
    localStorage.setItem('copyrightYear', conf.copyrightYear);
    localStorage.setItem('webmaster', conf.webmaster);
    localStorage.setItem('siteLogo', conf.siteLogo);
    localStorage.setItem('verifyExpires', conf.verifyExpires);
    localStorage.setItem('rateLimit', conf.rateLimit);
    localStorage.setItem('minPassLen', conf.minPassLen);
    localStorage.setItem('dwellTime', conf.dwellTime);
    localStorage.setItem('reCaptchaKey', conf.reCaptchaKey);
    localStorage.setItem('comingSoonMessage', conf.comingSoonMessage);
    localStorage.setItem('organisationName', conf.organisationName);
    localStorage.setItem('membershipRate', conf.membershipRate);
    localStorage.setItem('maxMembership', conf.maxMembership);
    localStorage.setItem('offlineCacheAge', conf.offlineCacheAge);
    localStorage.setItem('lcid', conf.lcid);
    localStorage.setItem('luid', conf.luid);
    sessionStorage.setItem('cid', conf.lcid); //set these up as the default starting position
    sessionStorage.setItem('auid', conf.luid);
    resolve();
  }).catch(() => {
    sessionStorage.setItem('cid', localStorage.getItem('lcid')); 
    sessionStorage.setItem('auid', localStorage.getItem('luid'));
    resolve()
  })

  if (localStorage.getItem('version') !== null) { //just one of the known values
    sessionStorage.setItem('cid', localStorage.getItem('lcid'));
    sessionStorage.setItem('auid', localStorage.getItem('luid'));
    resolve();
  }


});

const global = {
  get ready() {
    return Promise.all([configPromise,firstTabPromise]);
  },
  get user() {
    const u = sessionStorage.getItem('user')
    if (u === null) return {uid:0, global_admin: 0};
    return JSON.parse(u);
  },
  set user(v) {
    sessionStorage.setItem('user',JSON.stringify(v));
  },
  get cid () {
    return parseInt(sessionStorage.getItem('cid'),10);
  },
  set cid(v) {
    sessionStorage.setItem('cid',v);
  },
  get auid() {
    return parseInt(sessionStorage.getItem('auid'),10)
  },
  set auid(v) {
    sessionStorage.setItem('auid', v);
  },
  get clientLog () {
    return localStorage.getItem('clientLog');
  },
  get clientLogUid () {
    return parseInt(localStorage.getItem('clientLogUid'),10);
  },
  get version () {
    return localStorage.getItem('version');
  },
  get copyrightYear () {
    return localStorage.getItem('copyrightYear');
  },

  get reCaptchaKey () {
    return localStorage.getItem('reCaptchaKey');
  },
  get webmaster () {
    return localStorage.getItem('webmaster');
  },
  get siteLogo () {
    return localStorage.getItem('siteLogo');
  },
  get rateLimit () {
    return localStorage.getItem('rateLimit');
  },
  get verifyExpires () {
    return localStorage.getItem('verifyExpires');
  },
  get minPassLen () {
    return parseInt(localStorage.getItem('minPassLen'),10);
  },
  get dwellTime () {
    return parseInt(localStorage.getItem('dwellTime'),10);
  },
  get comingSoonMessage () {
    return localStorage.getItem('comingSoonMessage');
  },
  get organisationName () {
    return localStorage.getItem('organisationName');
  },
  get membershipRate () {
    return localStorage.getItem('membershipRate');
  },
  get maxMembership () {
    return localStorage.getItem('maxMembership');
  },
  get lcid() {
    return parseInt(localStorage.getItem('lcid'));
  }, 
  set lcid(v) {
    localStorage.setItem('lcid',v);
  },
  get luid() {
    return parseInt(localStorage.getItem('luid'), 10);
  },
  set luid (v) {
    localStorage.setItem('luid',v);
  }
}

export default global;