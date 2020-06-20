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


import './fancy-input.js';
import button from '../styles/button.js';
import page from '../styles/page.js';

import { SessionStatus } from '../modules/events.js';
import api from '../modules/api.js';
import './app-waiting.js';
import AppKeys from '../modules/keys.js';
import global from '../modules/globals.js';



/*
     <app-email-verify>: Collects, Email Address and Verifies against our participant database.
*/
class AppCancelMem extends LitElement {
  static get styles() {
    return [ button,page];
  }
  static get properties() {
    return {
      email: {type: String},
      waiting: {type: Boolean}
    };
  }
  constructor() {
    super();
    this.email = '';
    this.waiting = false;
    this._keyPressed = this._keyPressed.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    document.body.addEventListener('key-pressed', this._keyPressed);
    if (this.keys === undefined) {
      this.keys = new AppKeys(document.body, 'Enter Esc');
    } else {
      this.keys.connect();
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.keys.disconnect();
    document.body.removeEventListener('key-pressed', this._keyPressed);
  }
  firstUpdated() {
    this.input = this.shadowRoot.querySelector('#email');
  }

  render() {
    return html`
      <style>
        #email {
          width: var(--email-input-length);
        }


      </style>
      <app-waiting ?waiting=${this.waiting}></app-waiting>
      <app-page title="Cancel Membership">
        <p>You have requested that we cancel your membership request.</p>

        <p>If you do <strong>not</strong> want to proceed please hit the "Cancel Button below".  However if you <strong>do</strong>
        wish to proceed, please re-enter your email address to confirm that you are who we think you are and click on the "Confirm" below.</p>
        
        <p><em>Please note</em>, clicking on "Confirm" will remove all cookies related to this site from your computer.  You will have to go through
        the consent process again if you wish to re-apply</p> 
        <div class="form">
          <fancy-input
            label="E-Mail"
            .message=${this.email.length > 0? 'Email Unknown':'Required'}
            autofocus
            autocomplete="off"
            required
            type="email"
            name="email"
            id="email"
            .value="${this.email}"
            @value-changed="${this._emChanged}"></fancy-input>
        </div>
        <button slot="action" @click=${this._sendData}>Confirm</button>
        <button slot="action" cancel @click=${this._cancel}>Cancel</button>
      </app-page>
    `;
  }
  _emChanged(e) {
    this.email = e.changed;
    this.pending = false;
  }
  _keyPressed(e) {
    if(e.key.combo === 'Enter') {
      this._sendData();
      return true;
    } else if (e.key.combo === 'Esc') {
      this._logon();
      return true;
    }
    return false;
  }
  _cancel() {
    this.dispatchEvent(new SessionStatus({type:'cancel'}));
  }
  async _sendData() {
    if (!this.input.invalid) {
      this.waiting = true;
      const response = await api('session/cancel_membership_process',{email:this.email});
      this.waiting = false;
      if (response.found) {
        document.cookie = `${global.cookieVisitName}=; expires = Thu, 01 Jan 1970 00:00:00 GMT"; Path=/`; 
        document.cookie = `${global.cookieName}=; expires = Thu, 01 Jan 1970 00:00:00 GMT"; Path=/`; 
        this.dispatchEvent(new SessionStatus({ type: 'cancel' }));
      } else {
        this.input.invalid = true;
      }
    } 

  }
}
customElements.define('app-cancel-mem', AppCancelMem);