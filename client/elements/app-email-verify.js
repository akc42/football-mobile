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
import './app-page.js';
import AppKeys from '../modules/keys.js';





/*
     <app-email-verify>: Collects, Email Address and Verifies against our participant database.
*/
class AppEmailVerify extends LitElement {
  static get styles() {
    return [ button, page];
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
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.keys !== undefined) this.keys.connect();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.keys.disconnect();
  }
  firstUpdated() {
    this.input = this.shadowRoot.querySelector('#email');
    this.target = this.shadowRoot.querySelector('#page');

  }

  render() {
    return html`
      <style>
        #email {
          width: var(--email-input-length);
        }
      </style>
      <app-waiting ?waiting=${this.waiting}></app-waiting>
      <app-page heading="Welcome">
        <form id="verify" action="session/email_verify" @form-submit=${this._submit}>
          <label for="email">Email</label>
          <input type="email" name="email" id="email" placeholder=" " autocomplete="email" required autofocus/>
          <button type="submit">Continue</button>
        </form>
        <p>By continuing you agree to Melinda's Backups <a href="#" @click=${this._privacy}>conditions of use</a></p>
      </app-page>
    `;
  }
  _submit(e) {
    e.preventDefault();



    
  }







  _emChanged(e) {
    this.email = e.changed;
    this.pending = false;
  }

  _newMember(e) {
    e.stopPropagation();
    this.dispatchEvent(new SessionStatus({type:'member',email:this.email}));
  }

  async _sendData() {
    if (!this.input.invalid) {
      this.waiting = true;
      const data = await api('session/request_pin',{email:this.email, verify:true});
      this.waiting = false;
      if (data.found) {
        const type = data.password? (data.remember == 1? 'logonrem': 'logon'): 'await';
        this.dispatchEvent(new SessionStatus({type: type, email: this.email}));
        this.email = '';
      } else {
        this.input.invalid = true;
      } 
    } 

  }
}
customElements.define('app-email-verify', AppEmailVerify);