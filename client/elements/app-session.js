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
import page from '../styles/page.js';
import api from '../modules/api.js';
import global from '../modules/globals.js';
import { AuthChanged } from '../modules/events.js';
import Debug from '../modules/debug.js';
import {switchPath} from '../modules/utils.js';



const debug = Debug('session');

import './app-waiting.js';
import './app-overlay.js';


/*
     <app-session>
*/
class AppSession extends LitElement {
  static get styles() {
    return [page];
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
    this._setState = this._setState.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('logoff-request', this._logOff);
    this.addEventListener('session-status', this._setState);
    this.authorised = false;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('logoff-request', this._logOff);
    this.removeEventListener('session-status', this.__setState);
    this.authorised = null;
  }
  update(changed) {
    if (changed.has('authorised')) {
      if (!this.authorised) {
        this.state = 'validate';
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
        case 'validate':
          global.ready.then(() => { //only using this to wait until globals has been read, since this is the first state
            const mbball = new RegExp(`^(.*; +)?${global.cookieName}=([^;]+)(.*)?$`);
            if (mbball.test(document.cookie)) {
              performance.mark('start_user_validate');
              api('session/validate_user', {}).then(response => {
                performance.mark('end_user_validate');
                performance.measure('user_validate','start_user_validate','end_user_validate');
                if (response.user.uid !== 0) {
                  global.user = response.user; 
                  this.state = 'authorised';
                } else {
                  this.state = 'logon'
                }                
              });
            } else {
              this.state = 'logon';
            }
          });
          break;
        case 'authorised':
          this.authorised = true;
          break;
        case 'await':
          import('./app-await.js').then(this.waiting = false);
          break;
        case 'cancelmem':
          import('./app-cancel-mem.js').then(this.waiting = false);
          break;
        case 'emailverify':
          import('./app-email-verify.js').then(this.waiting = false);
          break;
        case 'linkexpired':
          import('./app-expired.js').then(this.waiting = false);
          break;
        case 'logoff':
          document.cookie = `${global.cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;
          this.state = 'consent';
          this.authorised = false;
          break;
        case 'logonrem':
        case 'logon':
          import('./app-logon.js').then(this.waiting = false);
          break;        
        case 'member':
        case 'memberapprove':
        case 'memberpin':
          import ('./app-member.js').then(this.waiting=false);
          break;
        case 'profile':
          switchPath('/profile');
          this.authorised = true;
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

      </style>
      <app-waiting ?waiting=${this.waiting}></app-waiting>
      ${cache(this.authorised? '' : html`
        <div @session-status=${this._setState}>
          ${cache({
            approve: html`<session-approve></session-approve>`,
            authorised:html`<div class="authorised"></div>`,
            email: html`<session-email></session-email>`,
            expired: html`<session-expired></session-expired>`,
            member: html`<session-member .email=${this.email}></session-member>`,
            password: html`<session-password .email=${this.email}></session-password>`,
            pin: html`<session-pin .email=${this.email}></session-pin>`,
            validate: html`<div class="validate"></div>`
          }[this.state])}
        </div>
      `)}
    `;
  }

  _logOff(e) {
    this.state = 'logoff';
  }

  _setState(e) {
    e.stopPropagation();
    if (e.status.email !== undefined) this.email = e.status.email;
    this.state = e.status.state;
  }
  }

}
customElements.define('app-session', AppSession);