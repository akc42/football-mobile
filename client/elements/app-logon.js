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

import {SessionStatus} from '../modules/events.js';
import global 
from '../modules/globals.js';
import './app-form.js';
import './fancy-input.js';
import './send-button.js';
import './app-waiting.js';
import './app-checkbox.js';
import AppKeys from '../modules/keys.js';
import button from '../styles/button.js';
import page from '../styles/app-page.js';

/*
     <app-logon>: Collects, username, password and notes forgotten password requests
*/
class AppLogon extends LitElement {
  static get styles() {
    return [page,button];
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

        #email,#pw {
          width: var(--email-input-length);
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
          action="/api/session/logon" 
          class="inputs" 
          @form-response=${this._formResponse}>
          <input type="hidden" name="usage" value=${this.profile ? 'profile': 'play'}/>
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
              message="Required"
              required
              type="password"
              name="password"
              id="pw"
              .value="${this.password}"
              @value-changed="${this._pwChanged}"
              @blur=${this._doneFirst}></fancy-input>
            <div id="forgotten" @click=${this._forgotten}>Forgotten Password</div>
            <app-checkbox ?value=${this.remember} @value-changed=${this._rememberChanged}>Remember Me</app-checkbox> 
        </app-form>
        <section slot="action">          
          <send-button @click=${this._sendData}>Log On</send-button>
        </section>
      </app-page>
    `;
  }
  _doneFirst() {
    this.doneFirst = true;
  }
  _emChanged() {
    this.email = e.changed;
  }
  async _forgotten(e) {
    if (!this.input.invalid) {
      this.waiting = true;
      const response = await api('session/requestpin',{email:this.email});
      this.waiting = false;
      if (response.data.found) {
        const type = response.data.password ? (response.data.remember ? 'markrem': 'markpass'): 'await';
        this.dispatchEvent(new SessionStatus({type: type, email: this.email}));
        this.email = '';
      } else {
        this.input.invalid = true;
      } 
    } 
  }
  _formResponse(e) {
    e.stopPropagation();
    if (e.response) {
      this.waiting = false;
      if (e.response.data.found) {
        setUser(response.user);
        const type = response.data.password? (response.data.remember? 'markrem': 'markpass'): 'await'
        this.dispatchEvent(new SessionStatus({type: type, email: this.email}));
        this.email = '';
        this.dispatchEvent(new AuthChanged(true));
      } else {
        this.emInput.invalid = true;
        this.pwInput.invalid = true;
        this.emInput.focus();
      } 
    }
  }
  _pwChanged(e) {
    this.password = e.changed;
  }
  _rememberChanged(e) {
    this.remember = e.changed;
  }
  _submitLogon() {
    if (!this.waiting) {
      const result = this.target.submit();
      if (result) {
        this.waiting = true;
        this.emInput.invalid = false;
        this.pwInput.invalid = false;
      }
    }
  }
}
customElements.define('app-logon', AppLogon);