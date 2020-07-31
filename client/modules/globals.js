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
let u = {uid:0};

let clientLog = '';
let clientLogUid = 0;
let version = 'v0.0.0';
let copyrightYear = '2020';
let cookieName = '';
let webmaster = '';
let siteLogo = '/appimages/site-logo.png';
let verifyExpires = 12;
let minPassLen = 6;
let dwellTime = 2000;
let reCaptchaKey = '';
let lrid = 0;
let lcid = 0;
let luid = 0;
let lgap = 0;
let cid = 0;

let usage = '';
let cookieConsent = false;

let globalPromise;

const global = {
  get ready() {
    if (globalPromise === undefined) {
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
      });
    }
    globalPromise.then(conf => {
      clientLog = conf.clientLog;
      clientLogUid = conf.clientLogUid;
      version = conf.version;
      copyrightYear = conf.copyrightYear;
      cookieName = conf.cookieName;
      webmaster = conf.webmaster;
      siteLogo = conf.siteLogo;
      verifyExpires = conf.verifyExpires;
      minPassLen = conf.minPassLen;
      dwellTime = conf.dwellTime;
      reCaptchaKey = conf.reCaptchaKey;
      lrid = conf.lrid;
      lcid = conf.lcid;
      luid = conf.luid;
      lgap = conf.lgap;
    })
    return globalPromise;
  },
  get user() {
    return u;
  },
  set user(v) {
    u = v;
  },
  get scope() {
    return usage;
  },
  set scope (v) {
    usage = v;
  },
  get cookieConsent() {
    return cookieConsent
  },
  set cookieConsent(v) {
    cookieConsent = v;
  },
  get cid () {
    return cid;
  },
  set cid(v) {
    cid = v;
  },
  set mockGlobal(v){
    globalPromise = v;
  },
  get clientLog () {
    return clientLog;
  },
  get clientLogUid () {
    return clientLogUid;
  },
  get version () {
    return version;
  },
  get copyrightYear () {
    return copyrightYear;
  },
  get cookieName () {
    return cookieName;
  },
  get reCaptchaKey () {
    return reCaptchaKey;
  },
  get webmaster () {
    return webmaster;
  },
  get siteLogo () {
    return siteLogo;
  },
  get verifyExpires () {
    return verifyExpires;
  },
  get minPassLen () {
    return minPassLen;
  },
  get dwellTime () {
    return dwellTime;
  },
  get lrid () {
    return lrid;
  },
  set lrid (v) {
    lrid = v;
  },
  get luid() {
    return luid;
  },
  set luid(v) {
    luid = v;
  },
  get lcid() {
    return lcid;
  },
  set lcid(v) {
    lcid = v;
  },
  get lgap() {
    return lgap;
  }
}

export default global;