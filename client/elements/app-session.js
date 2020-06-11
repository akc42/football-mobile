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

import { LitElement, html } from '../libs/lit-element.js';
import { cache } from '../libs/cache.js';
import api from '../modules/api.js';
import global from '../modules/globals.js';
import { AuthChanged, ApiError } from '../modules/events.js';
import Debug from '../modules/debug.js';


const debug = Debug('session');

import './app-waiting.js';
import './app-overlay.js';

/*
     <app-session>
*/
class AppSession extends LitElement {
  static get styles() {
    return [];
  }
  static get properties() {
    return {
      state: {type: String},
      authorised: {type: Boolean},
      waiting: {type: Boolean},
      email: {type: String},
      user: {type:String},
    };
  }
  constructor() {
    super();
    this.state = ''
    this.authorised = false;
    this.waiting = false;
    this._logOff = this._logOff.bind(this);
    this.email = '';
    this._reset = this._reset.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('logoff-request', this._logOff);
    this.addEventListener('session-status', this._reset);
    this.authorised = false;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('logoff-request', this._logOff);
    this.removeEventListener('session-status', this._reset);
    this.authorised = null;
  }
  update(changed) {
    if (changed.has('authorised')) {
      if (!this.authorised) {
        this.state = 'consent';
      } 
      this.dispatchEvent(new AuthChanged(this.authorised));
    }
    super.update(changed);
  }
  updated(changed) {
    if (changed.has('state')) {
      debug(`state-changed to ${this.state}`);
      this.waiting = true;   
      switch(this.state) {
        case 'consent':
          global.ready.then(() => { //only using this to wait until globals has been read, since this is the first state
            const mbvisited = new RegExp(`^(.*; +)?${global.cookieVisitName}=([^;]+)(.*)?$`);
            if (mbvisited.test(document.cookie)) {
              if (window.location.hash !== '') {
                this.state = window.location.hash.substring(1);
                history.pushState('', document.title, window.location.pathname
                  + window.location.search); //clear out our hash.
              } else {
                this.state = 'validate';
              }
            } else {
              import('./app-consent.js').then(this.waiting = false);
            }
          });
          break;
        case 'validate':
          //we can't get here without first having gone through consent
          const mbball = new RegExp(`^(.*; +)?${global.cookieName}=([^;]+)(.*)?$`);
          if (mbball.test(document.cookie)) {
            performance.mark('start_user_validate');
            api('session/validate_user', {}).then(response => {
              performance.mark('end_user_validate');
              performance.measure('user_validate','start_user_validate','end_user_validate');
              if (response.usage !== undefined) { //api request didn't fail
                global.user = response.user;              
                this.authorised = true;
                this.state = response.usage;
              }
            });
          } else {
            const mbvisited = new RegExp(`^(.*; +)?${global.cookieVisitName}=([^;]+)(.*)?$`);
            const matches = document.cookie.match(mbvisited);
            if (!matches || matches.length < 3 || typeof matches[2] !== 'string') this.state = 'forbidden';
            this.state = matches[2];
            debug(`State set from cookie is  ${this.state}`);
          }
          break;
        case 'await':
          this.waiting = true;
          import('./app-await.js').then(this.waiting = false);
        case 'emailverify':
          import('./app-email-verify.js').then(this.waiting = false);
          break;
        case 'linkexpired':
          import('./app-expired.js').then(this.waiting = false);
          break;
        case 'logoff':
          document.cookie = `${this.cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;
          this.state = 'consent';
          break;
        case 'member':
          import ('./stand-in.js').then(this.waiting=false);
          break;
        case 'markpass':
          this._makeVisitCookie('logon'); //we discovered this user has a password, so next visit he should log on.
          this.state = 'await';
          break;
        case 'pinpassrem':
        case 'pinpass':
        case 'logonrem':
        case 'logon':
          import('./app-logon.js').then(this.waiting = false);
          break;
        case 'requestpin':
          import('./app-request-pin.js').then(this.waiting = false);
          break;
        default:
      } 
    }
    super.updated(changed);
  }

  render() {
    return html`
      <style>
        :host {
          display: block;
          flex:1;
        }
      </style>
      <app-overlay id="inuse"></app-overlay>
      <app-waiting ?waiting=${this.waiting}></app-waiting>
      ${cache(this.authorised? '' : html`
        ${cache({
          consent: html`<app-consent @session-status=${this._consent}></app-consent>`,
          validate: html`<div>Validating</div>`,
          await: html`<app-await .email=${this.email}></app-await>`,
          emailverify: html`<app-email-verify @session-status=${this._processEmail}></app-email-verify>`,
          linkexpired: html`<app-expired @session-status=${this._processExpire}></app-expired>`,
          logon: html`<app-logon .email=${this.email}></app-logon>`,
          logonrem: html`<app-logon remember .email=${this.email}></app-logon>`,
          member: html`<app-member-req .step=${1} @session-status=${this._processEmail}></app-member-req>`,
          memberappove: html`<app-member-req .step=${2} @session-status=${this._processEmail}></app-member-req>`,
          memberpin: html`<app-member-req .step=${3} @session-status=${this._processEmail}></app-member-req>`,
          pinpass: html`<app-logon .email=${this.email} profile ></app-logon>`,
          pinpassrem: html`<app-logon remember .email=${this.email} profile ></app-logon>`,
          requestpin: html`<app-request-pin @session-status=${this._processEmail}></app-request-pin>`
        }[this.state])}
      `)}
    `;
  }
  _consent() {
    this._makeVisitCookie('emailverify'); //next state if we don't actually have a normal cookie
    this.state = 'validate'; //this makes us go check the cookie
  }
  _logOff(e) {
    this.state = 'logoff';
  }
  _makeVisitCookie(value) {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (90 * 24 * 60 * 60 * 100))
    document.cookie = `${global.cookieVisitName}=${value}; expires=${expiryDate.toGMTString()}; Path=/`; 
  }
  _processEmail(e) {
    e.stopPropagation();
    this.email = e.status.email;
    switch(e.status.type) {
      case 'membershipreq':
          this.state = 'member';
        break;
      case 'markrem':
        this._makeVisitCookie('logonrem'); //we have a password and they want us to remember them so mark (fall through this time);
        this.state = 'await';
        break;
      case 'markpass':
        this._makeVisitCookie('logon');  //we have a password in the database, so next time we can logon (fall throu this time)
      case 'await':
        this.state = 'await';
        break;
      default:
        
    }
  }
  _processExpire(e) {
    e.stopPropagation();

    if (e.status.type === 'verify') {
      this.state = 'emailverify';
    } else if (e.status.type === 'logon') {
      this._makeVisitCookie('logon');
      this.state = 'logon';
    }
  }
  _reset() {
    this.state = 'consent';
  }
}
customElements.define('app-session', AppSession);