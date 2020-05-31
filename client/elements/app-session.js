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
import { setUser } from '../modules/user.js';
import { AuthChanged } from '../modules/events.js';
import Debug from '../modules/debug.js';
import config from '../modules/config.js';

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
      webmaster: {type: String},
      email: {type: String},
      user: {type:String},
    };
  }
  constructor() {
    super();
    this.state = ''
    this.authorised = false;
    this.waiting = false;
    this.webmaster = 'webmaster@example.com';
    this._logOff = this._logOff.bind(this);
    this.email = '';
    config().then(conf => {
      this.cookieVisitName = conf.cookieVisitName;
      this.cookieName = conf.cookieName;
      this.webmaster = conf.webmaster;
    });
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('logoff-request', this._logOff);
    if (this.consentOverlay !== undefined) this.state = 'consent';
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('logoff-request', this._logOff);
    this.authorised = false;
  }
  update(changed) {
    if (changed.has('authorised')) {
      if (!this.authorised) this.state='consent';
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
          config().then(() => { //only using this to wait until config has been read, since this is the first state
            const mbvisited = new RegExp(`^(.*; +)?${this.cookieVisitName}=([^;]+)(.*)?$`);
            if (mbvisited.test(document.cookie)) {
              this.state = 'validate';
            } else {
              import('./app-consent.js').then(this.waiting = false);
            }
          });
          break;
        case 'validate':
          //we can't get here without first having gone through consent
          const mbball = new RegExp(`^(.*; +)?${this.cookieName}=([^;]+)(.*)?$`);
          if (mbball.test(document.cookie)) {
            performance.mark('start_user_validate');
            api('validate_user', {}).then(response => {
              if (response.usage !== undefined) { //api request didn't fail
                setUser(response.user);              
                if (response.usage === 'play') this.authorised = true;
                this.state = response.usage;
              } else {
                this.state = 'forbidden'
              }
            });
          } else {
            const mbvisited = new RegExp(`^(.*; +)?${this.cookieVisitName}=([^;]+)(.*)?$`);
            const matches = document.cookie.match(mbvisited);
            if (!matches || matches.length < 3 || typeof matches[2] !== 'string') this.state = 'forbidden';
            this.state = matches[2];
          }
          break;
        case'emailverify':
          import ('./app-email-verify.js').then(this.waiting = false);
          break;
        case 'await':
        case 'member':
          import ('./stand-in.js').then(this.waiting=false);
          break;
        case 'requestpin':
          import('./app-request-pin.js').then(this.waiting=false);
          break;
        case 'pinpass':
        case 'logon':
          import('./app-logon.js').then(this.waiting = false);
          break;
        default:
          import('./app-forbidden.js').then(this.waiting = false);
      } 
    }
    super.updated(changed);
  }
  firstUpdated() {
    this.consentOverlay = this.shadowRoot.querySelector('#consent');
    if (this.state === '') this.state = 'consent';
  }

  render() {
    return html`
      <style>
      :host {
        display:flex;
        flex-direction: column;
        flex: 1;
      }
      </style>

      <app-overlay id="inuse"></app-overlay>
      <app-waiting ?waiting=${this.waiting}></app-waiting>
      ${cache(this.authorised? '' : html`
        ${cache({
          consent: html`<app-consent @consent-accept=${this._consent}>Loading Consent Form</app-consent>`,
          validate: html`<div>Validating</div>`,
          forbidden: html`,<app-forbidden webmaster="${this.webmaster}"></app-forbidden>`,
          emailverify: html`<app-email-verify @email-status=${this._processEmail}>Loading Email Verify</app-email-verify>`,
          member: html`<stand-in standinfor="app-member"></stand-in>`,
          requestpin: html`<app-request-pin></app-request-pin>`,
          play: html`<div></div>`,
          logon: html`<app-logon .email=${this.email}></app-logon>`,
          pinpass: html`<app-logon .email=${this.email} profile ></app-logon>`,
          emailupdate: html`<app-logon profile ?visited=${this.visited}></app-logon>`,
          await: html`<stand-in standinfor="fm-await" ></stand-in >`

        }[this.state])}
      `)}
    `;
  }
  _consent() {
    this._makeVisitCookie('emailverify'); //next state if we don't actually have a cookie
    this.state = 'validate';
  }
  _fetchLogon() {
    import('./app-logon.js').then()
  }

  _logOff(e) {
    this.state = 'logoff';
  }
  _makeVisitCookie(value) {
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + (90 * 24 * 60 * 60 * 100))
    document.cookie = `${this.cookieVisitName}=${value}; expires=${expiryDate.toGMTString()}; Path=/`; 
  }
  _processEmail(e) {
    e.stopPropagation();
    this.email = e.status.email;
    switch(e.status.type) {
      case 'membershipreq':
          this.state = 'member';
        break;
      case 'matched':
        setUser(e.status.user);
        if (e.status.user.waiting_approval != 0) {
          this._makeVisitCookie('await');
          this.state = 'await';
        } else {
          if (e.status.user.password) {
            this._makeVisitCookie('logon');
            this.state = 'logon';
          } else {
            this.state = 'requestpin';
          }
        }
        break;
      default:
        this.state = 'forbidden';
    }
  }
}
customElements.define('app-session', AppSession);