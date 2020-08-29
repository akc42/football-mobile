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
import { AuthChanged, WaitRequest } from '../modules/events.js';
import Debug from '../modules/debug.js';

import {switchPath} from '../modules/utils.js';


const debug = Debug('session');




/*
     <session-manager>
*/
class SessionManager extends LitElement {
  static get styles() {
    return page;
  }

  static get properties() {
    return {
      state: {type: String},
      authorised: {type: Boolean},
      email: {type: String},
      user: {type:Object},
    };
  }
  constructor() {
    super();
    this.state = ''
    this.authorised = false;
    this.user = {uid: 0};
    this.email = '';
    this._setState = this._setState.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('session-status', this._setState);
    this.authorised = false;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('session-status', this._setState);
    this.authorised = null;
  }
  update(changed) {
    if (changed.has('authorised')) {
      if (!this.authorised) {
        this.state = 'reset';
      }
      this.dispatchEvent(new AuthChanged(this.authorised));
    }
    super.update(changed);
  }
  updated(changed) {
    if (changed.has('state')) {
      debug(`state-changed to ${this.state}`);
      this.dispatchEvent(new WaitRequest(true));
      switch(this.state) {
        case 'authorised':
          global.user = this.user;
          this.authorised = true;
          break;
        case 'error': 
          break;
        case 'logoff':
          document.cookie = `${global.cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;
          this.authorised = false;
          this.state = 'email';
          global.user = {uid:0}
          switchPath('/'); //this makes url hidden if back in session manager
          break;
        case 'reset':
          this.email = '';
          global.ready.then(() => { //only using this to wait until globals has been read, since this is the first state
            const mbball = new RegExp(`^(.*; +)?${global.cookieName}=([^;]+)(.*)?$`);
            if (mbball.test(document.cookie)) {
              performance.mark('start_user_validate');
              api('session/validate_user', {}).then(response => {
                performance.mark('end_user_validate');
                performance.measure('user_validate','start_user_validate','end_user_validate');
                if (response.user.uid !== 0) {
                  this.user = response.user;
                  this.state = 'authorised';
                } else {
                  this._readHash();
                }
              });
            } else {
              this._readHash();
            }
          });
          break;
        default:
          import(`./session-${this.state}.js`).then(() => this.dispatchEvent(new WaitRequest(false)));
          switchPath('/'); //this makes url hidden if back in session manager
      }
    }
    super.updated(changed);
  }

  render() {
    return html`
      ${cache(this.authorised? '' : html`
          ${cache({
            approve: html`<session-approve .user=${this.user}></session-approve>`,
            authorised:html`<div class="authorised"></div>`,
            email: html`<session-email></session-email>`,
            error: html`<div class="error"></div>`,
            expired: html`<session-expired></session-expired>`,
            forgotten: html`<session-forgotten .user=${this.user}></session-forgotten>`,
            logoff: html`<div class="logoff"></div>`,
            member: html`<session-member .email=${this.email}></session-member>`,
            mempass: html`<session-mempass .user=${this.user}></session-mempass>`,
            mprocess: html`<session-mprocess .email=${this.email}></session-mprocess>`,
            password: html`<session-password .user=${this.user}></session-password>`,
            pin: html`<session-pin .email=${this.email}></session-pin>`,
            private: html`<session-private></session-private>`,
            reset: html`<div class="reset"></div>`,
            toomany: html`<session-toomany></session-toomany>`,
            welcome: html`<session-welcome .email=${this.email}></session-welcome>`
          }[this.state])}
      `)}
    `;
  }
  _readHash() {
    if(typeof window.location.hash != "undefined") {
      switch (window.location.hash) {
        case '#expired':
          this.state = 'expired';
          break;
        case '#member':
          this.state = 'approve';
          break;
        default:
          this.state = 'email';
      }
    } else {
      this.state = 'email';
    }
  }
  _setState(e) {
    e.stopPropagation();
    if (e.status.email !== undefined) this.email = e.status.email;
    if (e.status.user !== undefined) this.user = e.status.user;
    this.state = e.status.state;
  }
}
customElements.define('session-manager', SessionManager);
