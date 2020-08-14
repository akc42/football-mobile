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


import './fm-input.js';
import './fm-checkbox.js';
import './fm-page.js';
import './form-manager.js';
import './material-icon.js';
import './waiting-indicator.js';

import button from '../styles/button.js';
import page from '../styles/page.js';
import api from '../modules/api.js';
import AppKeys from '../modules/keys.js';
import global from '../modules/globals.js';
import { AuthChanged } from '../modules/events.js';
import { switchPath } from '../modules/utils.js';

/*
     <profile-manager>
*/
class ProfileManager extends LitElement {
  static get styles() {
    return [button, page];
  }
  static get properties() {
    return {
      route: {type: Object},
      name: {type: String},
      email: {type: String},
      password: {type: String},
      replica: {type: String},
      remember: {type: Boolean},
      waiting:{type: Boolean},
      showpass: {type:Boolean}
    };
  }
  constructor() {
    super();
    this.name = '';
    this.email = '';
    this.password = '';
    this.replica = '';
    this.remember = false;
    this.waiting = false;
    this.showpass = false;
    this._keyPressed = this._keyPressed.bind(this);
    this.keyTarget = document.querySelector('body');
  }
  connectedCallback() {
    super.connectedCallback();
    this.password = '';
    this.replica = '';
    this.showpass = false;
    this.name = global.user.name;
    this.email = global.user.email;
    this.remember = global.user.remember === 1;
    this.keyTarget.addEventListener('keys-pressed', this._keyPressed);
    if (this.keys === undefined) {
      /*
        Keys are in order send, cancel, toggle remember, jump and select display name, 
        jump and select email, password visibility
      */
      this.keys = new AppKeys(this.keyTarget, 'enter esc f1 f2 f3 f4', true);
    } else {
      this.keys.connect();
    }

  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.keyTarget.removeEventListener('keys-pressed', this._keyPressed);
    this.keys.disconnect();
   
  }

  firstUpdated() {
    this.dinput = this.shadowRoot.querySelector('#displayname');
    this.einput = this.shadowRoot.querySelector('#email');
    this.pinput = this.shadowRoot.querySelector('#pw');
    this.rinput = this.shadowRoot.querySelector('#replica');
    this.doProfile = this.shadowRoot.querySelector('#doprofile')
  }

  render() {
    return html`
      <style>
        #email {
          width: var(--email-input-length);
        }
        #pw, #replica {
          width: var(--pw-input-length);
        }
        #displayname {
          width: var(--name-input-length);
        }
        .subtitle {

          font-weight:bold;
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
        .names {
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: space-between;
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
        .fixedemail {
          font-size: 10pt;
        }
        .fixedemail span {
          font-weight:400;
          font-size: 13.3333px;
          font-family: Roboto, sans-serif;
        }
        .explain {
          align-self: center;
        }
      </style>
      <waiting-indicator ?waiting=${this.waiting}></waiting-indicator>
      <fm-page @key-pressed=${this._keyPressed} id="page" heading="Your Profile">
     
        <form-manager
          id="doprofile" 
          action="profile/update_profile" 
          class="inputs" 
          @form-response=${this._formResponse}>
            <input type="hidden" name="uid" value="${global.user.uid}" />
            <div class="names">
              <fm-input 
                id="displayname" 
                label="Display Name" 
                name="name"
                .message=${this.name.length > 0 ?'Name already in use':'Required'}
                required 
                value=${this.name}
                validate=${this._checkDisplayName}
                autofocus
                @value-changed=${this._dnChanged}
                autocomplete="off"></fm-input>
              <p class="title."> User Profile<br/>
                <span class="subtitle">User Id: ${global.user.uid}</span></p>
            </div>
      
            <fm-input
              label="E-Mail"
              message="Use a valid email address"
              autocomplete="off"
              type="email"
              name="email"
              id="email"
              .value="${this.email}"
              @value-changed="${this._emChanged}"></fm-input>
            <p id="enote">If you change this, you will be sent a link to verify it before you can use it to log in.  Use your original
            email before then.</p> 


            
            <div id="passwords">
              <fm-input              
                label="Password"
                .message="min ${global.minPassLen} chars"
                type="${this.showpass? 'text':'password'}"
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
                Click the eye to ${this.showpass?'hide':'show'} passwords</p>
              
              <p id="pnote" class="explain">Only enter a password if you wish to change it.</p>
            </div>

            <fm-checkbox ?value=${this.remember} @value-changed=${this._rememberChanged} name="remember">Remember Me</fm-checkbox>
        </form-manager>

        <button slot="action" @click=${this._changeProfile}>Update</button>
        <button slot="action" cancel @click=${this._cancel}>Cancel</button>
      
      </fm-page>
    `;
  }
  _cancel(e) {
    e.stopPropagation();
    switchPath('/');
  }
  _changeProfile() {
    if (!this.waiting) {
      const result = this.doProfile.submit();
      if (result) {
        this.waiting = true;
        this.dinput.invalid = false;
        this.einput.invalid = false;
        this.pinput.invalid = false;
        this.rinput.invalid = false;
      }
    }
  }
  async _checkDisplayName() {
    if (this.name.length > 0 && this.name !== global.user.name) {
      this.waiting = true;
      const found = await api('profile/check_names', {name: this.name });
      this.waiting = false;
      this.dinput.invalid = found;
    }
  }
  _dnChanged(e){
    this.name = e.changed;
    if (this.name.length > 0) {
      this.dinput.invalid = false;
    } else {
      this.dinput.invalid = true;
    }
  }
  _emChanged(e) {
    this.email = e.changed;
    
  }
  _formResponse(e) {
    e.stopPropagation();
    this.waiting = false;
    if (e.response.usage === 'authorised') {
      global.scope = 'authorised'; //just in case it wasn't before
    } else {
      this.dispatchEvent(new AuthChanged(false)); //authorised so time to leave
    }
    switchPath('/');

  }
  _keyPressed(e) {
    switch(e.key) {
      case 'enter':
        this._changeProfile();
        break;
      case 'esc':
        this._cancel();
        break;
      case 'f1':
        this.remember = !this.remember;
        break;
      case 'f2':
        this.dinput.focus();
        break;
      case 'f3':
        if (global.scope = 'authorised') {
          this.einput.focus();
        }
        break;
      case 'f4':
        this._toggleVisibility();
        break;
    }

  }
  _pwChanged(e) {
    this.password = e.changed;
    if(this.pinput) this.pinput.invalid = !this._pwValidate();
    if(this.rinput) this.rinput.invalid = !this._replicaValidate();
  }
  _pwValidate() {
    if (this.password === undefined) return true;
    return !(this.password.length > 0 && this.password.length < global.minPassLen);
  }
  _rememberChanged(e) {
    this.remember = e.changed;
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
customElements.define('profile-manager', ProfileManager);