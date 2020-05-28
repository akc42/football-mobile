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
import setUser from '../modules/user.js';
import { AuthChanged } from '../modules/events.js';
import Debug from '../modules/debug.js';
import config from '../modules/config.js';

const debug = Debug('session');

import './stand-in.js';
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
      visited: {type: Boolean}
    };
  }
  constructor() {
    super();
    this.state = ''
    this.authorised = false;
    this.waiting = false;
    this.visited = false;
    this._logOff = this._logOff.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('logoff-request', this._logOff);
    this.state = 'validate';
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('logoff-request', this._logOff);
    this.authorised = false;
  }
  update(changed) {
    if (changed.has('authorised')) {
      if (!this.authorised) this.state='validate';
      this.dispatchEvent(new AuthChanged(this.authorised));

    }
    super.update(changed);
  }
  updated(changed) {
    if (changed.has('state')) {
      debug(`state-changed to ${this.state}`);
      switch(this.state) {
        case 'validate':
          config().then(conf => {
            const mbball = RegExp(`^(.*; +)?${conf.cookieName}=[^;]+(.*)?$`);
            const mbvisited = RegExp(`^(.*; +)?${conf.cookieVisitName}=[^;]+(.*)?$`);
            this.visited = mbvisited.test(document.cookie);
            if (mbball.test(document.cookie)) {
              performance.mark('start_user_validate');
              api('validate_user', {}).then(response => {
                if (response.usage !== undefined) { //api request didn't fail
                  setUser(response.user);
                  if (response.usage === 'play') this.authorised = true;
                  this.state = response.usage;
                } else {
                  this.state = 'logon'
                }
              });
            } else {
              this.state = 'logon';
            }
            });
          break;
        case 'logon':
          import('./fm-logon.js');
          break;
      } 
    }
    super.updated(changed);
  }
  firstUpdated() {
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
      <app-overlay id="email"></app-overlay>
      <app-overlay id="inuse"></app-overlay>
      <app-waiting ?waiting=${this.waiting}></app-waiting>
      ${cache(this.authorised? '' : html`
        ${cache({
          validate: html`<div></div>`,
          play: html`<div></div>`,
          logon: html`<fm-logon ?visited=${this.visited}></fm-logon>`,
          pinpass: html`<fm-login profile ?visited=${this.visited}></fm-login>`,
          emailupdate: html`<fm-login profile ?visited=${this.visited}></fm-login>`,
          await: html`<stand-in standinfor="fm-await" ></stand-in >`

        }[this.state])}
      `)}
    `;
  }
  _fetchLogon() {
    import('./fm-logon.js').then()
  }

  _logOff(e) {
    this.state = 'logoff';
  }
}
customElements.define('app-session', AppSession);