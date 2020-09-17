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

let u = {uid:0};

let clientLog = '';
let clientLogUid = 0;
let version = 'v0.0.0';
let copyrightYear = '2020';
let webmaster = '';
let siteLogo = '/appimages/site-logo.png';
let verifyExpires = 12;
let rateLimit = 30;
let minPassLen = 6;
let dwellTime = 2000;
let reCaptchaKey = '';

let lcid = 0; //latest competition
let luid = 0; //administrator of latest competition;
let cid = 0;
let comingSoonMessage = '';
let organisationName = '';
let membershipRate = 60;
let maxMembership = 3;
let firstTab;
let token;

const firstTabPromise = new Promise(resolve => {
  const tabId = Date.now();
  const timer = setTimeout(() => {
    resolve(true);
  }, 70);
  const storageEventHandler = (e) => {
    if (e.key === 'pageOpen') {
      localStorage.setItem('pageAvailable',tabId);
    }
    if (e.key === 'pageAvailable') {
      clearTimeout(timer);
      resolve(false);
    }
  };
  localStorage.setItem('pageOpen', tabId);
  window.addEventListener('storage', storageEventHandler);
  const unloadHandler = () => {
    window.removeEventListener('storage', storageEventHandler);
    window.removeEventListener('unload', unloadHandler);
  };
  window.addEventListener('unload', unloadHandler)
}).then(ft => {
  sessionStorage.setItem('firstTab', ft);
  if (ft) {
    //lets see if we have a token with our credentials to use
    token = localStorage.getItem('token');
    if (token !== null ) {
      sessionStorage.setItem('token', token);
    }
  }
});


let globalPromise;

const global = {
  get ready() {
    if (globalPromise === undefined) {
      if (sessionStorage.getItem('copyrightYear') === null) { //just one of the known values
        globalPromise = window.fetch('/api/config/config', { method: 'get' }).then(async response => {
          let text;
          if (!response.ok) throw new ApiError(response.status);
          text = await response.text();
          try {
            return JSON.parse(text);
          } catch (err) {
            //we failed to parse the json - the actual code should be in the text near the end;
            throw new ApiError(parseInt(text.substr(-6, 3), 10));
          }
        }).then(conf => {
          sessionStorage.setItem('clientLog', conf.clientLog);
          sessionStorage.setItem('clientLogUid', conf.clientLogUid);
          sessionStorage.setItem('version', conf.version);
          sessionStorage.setItem('copyrightYear', conf.copyrightYear);
          sessionStorage.setItem('webmaster', conf.webmaster);
          sessionStorage.setItem('siteLogo', conf.siteLogo);
          sessionStorage.setItem('webmaster',conf.webmaster);
          sessionStorage.setItem('siteLogo',conf.siteLogo);
          sessionStorage.setItem('verifyExpires',conf.verifyExpires);
          sessionStorage.setItem('rateLimit',conf.rateLimit);
          sessionStorage.setItem('minPassLen',conf.minPassLen);
          sessionStorage.setItem('dwellTime',conf.dwellTime);
          sessionStorage.setItem('reCaptchaKey',conf.reCaptchaKey);
          sessionStorage.setItem('comingSoonMessage',conf.comingSoonMessage);
          sessionStorage.setItem('organisationName',conf.organisationName);
          sessionStorage.setItem('membershipRate',conf.membershipRate);
          sessionStorage.setItem('maxMembership',conf.maxMembership);
          sessionStorage.setItem('lcid',conf.lcid);
          sessionStorage.setItem('luid',conf.luid);
          sessionStorage.setItem('cid', conf.lcid); //set these up as the default starting position
          sessionStorage.setItem('auid', conf.luid);
        });
      } else {
        //We must have refreshed because alread have storage set.
        globalPromise = Promise.resolve();
      }
    }
    return Promise.all([globalPromise,firstTabPromise]);
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
    return sessionStorage.getItem('clientLog');
  },
  get clientLogUid () {
    return parseInt(sessionStorage.getItem('clientLogUid'),10);
  },
  get version () {
    return sessionStorage.getItem('version');
  },
  get copyrightYear () {
    return sessionStorage.getItem('copyrightYear');
  },

  get reCaptchaKey () {
    return sessionStorage.getItem('reCaptchaKey');
  },
  get webmaster () {
    return sessionStorage.getItem('webmaster');
  },
  get siteLogo () {
    return sessionStorage.getItem('siteLogo');
  },
  get rateLimit () {
    return sessionStorage.getItem('rateLimit');
  },
  get verifyExpires () {
    return sessionStorage.getItem('verifyExpires');
  },
  get minPassLen () {
    return parseInt(sessionStorage.getItem('minPassLen'),10);
  },
  get dwellTime () {
    return parseInt(sessionStorage.getItem('dwellTime'),10);
  },
  get comingSoonMessage () {
    return sessionStorage.getItem('comingSoonMessage');
  },
  get organisationName () {
    return sessionStorage.getItem('organisationName');
  },
  get membershipRate () {
    return sessionStorage.getItem('membershipRate');
  },
  get maxMembership () {
    return sessionStorage.getItem('maxMembership');
  },
  get lcid() {
    return parseInt(sessionStorage.getItem('lcid'));
  }, 
  set lcid(v) {
    sessionStorage.setItem('lcid',v);
  },
  get luid() {
    return parseInt(sessionStorage.getItem('luid'), 10);
  },
  set luid (v) {
    sessionStorage.setItem('luid',v);
  }
}

export default global;