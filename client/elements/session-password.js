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
import {cache} from '../libs/cache.js';

import button from '../styles/button.js';
import page from '../styles/page.js';

import { SessionStatus, WaitRequest } from '../modules/events.js';
import global from '../modules/globals.js';

import './fm-page.js';
import './form-manager.js';
import './fm-input.js';
import './fm-checkbox.js';


import AppKeys from '../modules/keys.js';




/*
     <session-password>: 2nd Stage Login, password entry.
*/
class SessionPassword extends LitElement {
  static get styles() {
    return [ button,page];
  }
  static get properties () {
    return {
      user: {type: Object},
      showpass: {type: Boolean},
      password: {type: String}
    };
  }
  constructor() {
    super();
    this.user={uid: 0, remember: 0};
    this.showpass = false;
    this.password = '';
    this._keyPressed = this._keyPressed.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    document.body.addEventListener('key-pressed', this._keyPressed);
    if (this.keys === undefined) {
      this.keys = new AppKeys(document.body, 'Enter');
    } else {
      this.keys.connect();
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.keys.disconnect();
    document.body.removeEventListener('key-pressed', this._keyPressed);
    this.password = '';
    this.replica = '';
  }
  firstUpdated() {
    this.request = this.shadowRoot.querySelector('#makereq');
    this.pinput = this.shadowRoot.querySelector('#pw');
  }

  render() {
    return html`
      <style>
        #pw {
          width: var(--pw-input-length);
        }
        #passwords {
          display: grid;
          align-items:center;
          grid-gap: 5px;
          grid-template-columns: 1fr 1fr;
          grid-template-areas:
            "pw see"
            "forgot remember"
        }
        #pw {
          grid-area:pw;
        }
        #see {
          grid-area: see;
          font-size:8pt;
          margin-bottom:0px;
          
        }
        #see material-icon {
          cursor: pointer;
          --icon-size: 18px;
          margin-right: 10px;
        }
        #forgotten {
          grid-area: forgot;
        }
        fm-checkbox {
          grid-area: remember;
        }

      </style>
      <fm-page heading="Sign In">
        <form-manager id="makereq" action="session/logon" @form-response=${this._formResponse}>     
          <input type="hidden" name="uid" value="${this.user.uid}" /> 
          <div id="passwords">
            <fm-input
              label="Password"
              autofocus
              .message="min ${global.minPassLen} chars"
              type="${this.showpass ? 'text' : 'password'}"
              name="password"
              id="pw"
              .value=${this.password}
              @value-changed=${this._pwChanged}
              .validator=${this._pwValidate}>
            </fm-input>
            <p id="see">
              <material-icon @click=${this._toggleVisibility}>${this.showpass ? 'visibility_off' : 'visibility'}</material-icon>
              Click the eye to ${this.showpass ? 'hide' : 'show'} password</p> 
            ${cache(this.user.waiting_approval === 0?html`
              <fm-checkbox
                name="remember"
                .value=${this.user.remember === 1} 
                @value-changed=${this._rememberChanged}>Remember Me</fm-checkbox>
              `:'')}

            <p id="forgotten"><a href="#" @click=${this._forgotten}>Forgotten Password</a></p>
          </div>
        </form-manager>
        
        <button slot="action" @click=${this._proceed}>Sign In</button>  
      </fm-page>
    `;
  }

  _forgotten(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(new SessionStatus({ state: 'forgotten' }));
  }
  _formResponse(e) {
    e.stopPropagation();
    this.dispatchEvent(new WaitRequest(false));
    this.dispatchEvent(new SessionStatus({ state: e.response.state, user: e.response.user }));
  }
  _keyPressed(e) {
    if (e.key === 'Enter') {
      this._proceed(e);
      return true;

    }
    return false;
  }
  async _proceed(e) {
    e.stopPropagation();
    const result = this.request.submit();
    if (result) {
      this.dispatchEvent(new WaitRequest(true));
      this.pinput.invalid = false;
    }
  }
  _pwChanged(e) {
    this.password = e.changed;
    if (this.pinput) this.pinput.invalid = !this._pwValidate();
  }
  _pwValidate() {
    if (this.password === undefined) return true;
    return !(this.password.length > 0 && this.password.length < global.minPassLen);
  }
  _rememberChanged(e) {
    e.stopPropagation();
    this.user.remember = e.changed? 1:0;
  }
  async _toggleVisibility() {
    this.showpass = !this.showpass;
    await this.requestUpdate();
    this.pinput = this.shadowRoot.querySelector('#pw');
  }
}
customElements.define('session-password', SessionPassword);