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

import button from '../styles/button.js';
import page from '../styles/page.js';

import sid from '/api/tracking.js';

import { SessionStatus, WaitRequest } from '../modules/events.js';
import global from '../modules/globals.js';

import './fm-page.js';
import './re-captcha.js';
import './form-manager.js';
import './fm-input.js';


import AppKeys from '../modules/keys.js';




/*
     <Session expired>: Displays an Error Message when A Pin token has expired.
*/
class SessionMember extends LitElement {
  static get styles() {
    return [ button,page];
  }
  static get properties () {
    return {
      email: {type: String},
      showpass: {type: Boolean},
      password: {type: String},
      replica: {type: String},
    };
  }
  constructor() {
    super();
    this.email='';
    this.showpass = false;
    this.password = '';
    this.replica = '';
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
    this.password = '';
    this.replica = '';
  }
  firstUpdated() {
    this.request = this.shadowRoot.querySelector('#makereq');
    this.pinput = this.shadowRoot.querySelector('#pw');
    this.rinput = this.shadowRoot.querySelector('#replica');
  }

  render() {
    return html`
      <style>
        #pw, #replica {
          width: var(--pw-input-length);
        }
        #passwords {
          display: grid;
          align-items:center;
          grid-gap: 5px;
          grid-template-columns: 1fr 1fr;
          grid-template-areas:
            "pw1 ."
            "pw1 see"
            "pw1 note"
            "pw2 note"
        }
        #pw {
          grid-area:pw1;
        }
        #replica {
          grid-area: pw2;
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
        #pnote {
          grid-area: note;
        }

      </style>
      <fm-page heading="Membership">
        <form-manager id="makereq" action="session/new_member_verify" @form-response=${this._formResponse}>
          <re-captcha></re-captcha>      
          <input type="hidden" name="email" value="${this.email}" /> 
          <input type="hidden" name="sid" value="${sid}" />
          <div id="passwords">
            <fm-input
              label="Password"
              .message="min ${global.minPassLen} chars"
              type="${this.showpass ? 'text' : 'password'}"
              name="password"
              id="pw"
              .value=${this.password}
              @value-changed=${this._pwChanged}
              .validator=${this._pwValidate}>
            </fm-input>
            <fm-input
              label="Repeat"
              .message="${'does not match'}"
              type="${this.showpass ? 'text' : 'password'}"
              name="replica"
              id="replica"
              .value=${this.replica}
              @value-changed=${this._repChanged}
              .validator=${this._replicaValidate}>
            </fm-input>
            <p id="see">
              <material-icon @click=${this._toggleVisibility}>${this.showpass ? 'visibility_off' : 'visibility'}</material-icon>
              Click the eye to ${this.showpass ? 'hide' : 'show'} passwords</p> 
          </div>
        </form-manager>
        <p>Click on the link to find out about the <a href="#" @click=${this._mprocess}>Membership Process</a></p>
        <button slot="action" cancel @click=${this._cancel}>Cancel</button>
        <button slot="action" @click=${this._proceed}>Proceed</button>  
      </fm-page>
    `;
  }
  _cancel (e) {
    e.stopPropagation();
    this.dispatchEvent(new SessionStatus({state: 'email'}));
  }
  _formResponse(e) {
    e.stopPropagation();
    this.dispatchEvent(new WaitRequest(false));
    this.dispatchEvent(new SessionStatus({ state: e.response.state, email: this.email }));
  }
  _keyPressed(e) {
    if (e.key.combo === 'Enter') {
      this._proceed(e);
      return true;
    } else if (e.key.combo === 'Esc') {
      this._cancel(e);
    }
    return false;
  }
  _mprocess(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(new SessionStatus({state: 'mprocess'}));
  }
  async _proceed(e) {
    e.stopPropagation();
    const result = this.request.submit();
    if (result) {
      this.dispatchEvent(new WaitRequest(true));
      this.pinput.invalid = false;
      this.rinput.invalid = false;
    }
  }
  _pwChanged(e) {
    this.password = e.changed;
    if (this.pinput) this.pinput.invalid = !this._pwValidate();
    if (this.rinput) this.rinput.invalid = !this._replicaValidate();
  }
  _pwValidate() {
    if (this.password === undefined) return true;
    return !(this.password.length > 0 && this.password.length < global.minPassLen);
  }
  _repChanged(e) {
    this.replica = e.changed;
    if (this.pinput) this.pinput.invalid = !this._pwValidate();
    if (this.rinput) this.rinput.invalid = !this._replicaValidate();
  }
  _replicaValidate() {
    return this.password === this.replica;
  }
  async _toggleVisibility() {
    this.showpass = !this.showpass;
    await this.requestUpdate();
    this.pinput = this.shadowRoot.querySelector('#pw');
    this.rinput = this.shadowRoot.querySelector('#replica');
  }
}
customElements.define('session-member', SessionMember);