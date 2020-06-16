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

import {AuthChanged,SessionStatus} from '../modules/events.js';
import global from '../modules/globals.js';
import api from '../modules/api.js';

import './app-form.js';
import './fancy-input.js';
import './app-waiting.js';
import './app-checkbox.js';
import AppKeys from '../modules/keys.js';
import button from '../styles/button.js';
import page from '../styles/app-page.js';
import consent from '../styles/consent.js';
import { markSeen } from '../modules/visit.js';
import { switchPath } from '../modules/utils.js';

/*
     <app-logon>: Collects, username, password and notes forgotten password requests
*/
class AppLogon extends LitElement {
  static get styles() {
    return [page,button,consent];
  }
  static get properties() {
    return {
      email: {type: String},
      password: {type: String},
      remember: {type: Boolean},
      profile: {type: Boolean},
      waiting: {type: Boolean}
    };
  }
  constructor() {
    super();
    this.email = '';
    this.password = '';
    this.remember = false;
    this.profile = false;
    this.waiting = false;
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.keys !== undefined) this.keys.connect();
    this.doneFirst = false;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.keys.disconnect();
    this.password = '';
    markSeen();
  }
  firstUpdated() {
    this.target = this.shadowRoot.querySelector('#page');
    this.keys = new AppKeys(this.target, 'Enter'); 
    this.emInput = this.shadowRoot.querySelector('#email')
    this.pwInput = this.shadowRoot.querySelector('#pw');
    this.doLogon = this.shadowRoot.querySelector('#logon');
  }

  render() {
    return html`
      <style>

        #email {
          width: var(--email-input-length);
        }
        #pw {
          width: var(--pw-input-length);
        }
        #forgotten {
          font-size:60%;
          margin: 20px;
        }

      </style>
      <app-waiting ?waiting=${this.waiting}></app-waiting>
      <app-page id="page" @keys-pressed=${this._submitLogon}>
        <h1>Log On</h1>
        <app-form 
          id="logon" 
          action="session/logon" 
          class="inputs" 
          @form-response=${this._formResponse}>
          <fancy-input
            label="E-Mail"
            .message=${this.email.length > 0 ? 'Email Or Password Incorrect' : 'Required'}
            autofocus
            autocomplete="off"
            required
            type="email"
            name="email"
            id="email"
            .value="${this.email}"
            @value-changed="${this._emChanged}"
            @blur=${this._doneFirst}></fancy-input>  
            <fancy-input              
              label="Password"
              .message="min ${global.minPassLen} chars"
              required
              .minlength=${global.minPassLen}
              type="password"
              name="password"
              id="pw"
              .value="${this.password}"
              @value-changed="${this._pwChanged}"
              @blur=${this._doneFirst}></fancy-input>
            <div id="forgotten" @click=${this._forgotten}>Forgotten Password (Enter Email before clicking)</div>
            <app-checkbox ?value=${this.remember} @value-changed=${this._rememberChanged} name="remember">Remember Me</app-checkbox> 
              ${cache(global.cookieConsent ? '' : html`<p class="consent">The Remember checkbox, when checked formally gives us permission to store a cookie with your user details on your computer until you next formally log out. Do not do this if this computer is public.</p>`)} 
        </app-form>
        <section slot="action">          
          <button @click=${this._submitLogon}>Log On</button>
        </section>
      </app-page>
    `;
  }
  _doneFirst() {
    this.doneFirst = true;
  }
  _emChanged(e) {
    this.email = e.changed;
  }
  async _forgotten(e) {
    if (!this.emInput.invalid) {
      this.waiting = true;
      const response = await api('session/request_pin',{email:this.email});
      this.waiting = false;
      if (response.found) {
        const type = response.password ? (response.remember ? 'markrem': 'markpass'): 'await';
        this.dispatchEvent(new SessionStatus({type: type, email: this.email}));
        this.email = '';
      } else {
        this.emInput.invalid = true;
      } 
    } 
  }
  _formResponse(e) {
    e.stopPropagation();
    if (e.response) {
      this.waiting = false;
      if (e.response.user) {
        markSeen();
        global.user = e.response.user;
        global.scope = e.response.usage;
        const type = e.response.user.remember === 1 ? 'logonrem': 'logon'
        this.dispatchEvent(new SessionStatus({type: type, email: this.email}));
        this.email = '';
      } else {
        this.emInput.invalid = true;
        this.pwInput.invalid = true;
        this.emInput.focus();
      } 
    }
  }
  _pwChanged(e) {
    this.password = e.changed;
    this.emInput.validate();
  }
  _rememberChanged(e) {
    this.remember = e.changed;
    markSeen();
  }
  _submitLogon() {
    if (!this.waiting) {
      const result = this.doLogon.submit();
      if (result) {
        this.waiting = true;
        this.emInput.invalid = false;
        this.pwInput.invalid = false;
      }
    }
  }
}
customElements.define('app-logon', AppLogon);