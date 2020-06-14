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
import { classMap } from '../libs/class-map.js';
import { cache } from '../libs/cache.js';


import './fancy-input.js';
import './app-checkbox.js';
import button from '../styles/button.js';
import page from '../styles/page.js';
import api from '../modules/api.js';
import './app-waiting.js';
import AppKeys from '../modules/keys.js';
import global from '../modules/globals.js';

/*
     <app-profile>
*/
class AppProfile extends LitElement {
  static get styles() {
    return [button, page];
  }
  static get properties() {
    return {
      name: {type: String},
      email: {type: String},
      password: {type: String},
      replica: {type: String},
      remember: {type: Boolean},
      route: {type: Object},
      waiting:{type: Boolean}
    };
  }
  constructor() {
    super();
    this.name = '';
    this.email = '';
    this.password = '';
    this.replica = '';
    this.remember = false;
    this.route = { active: false };
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.keys !== undefined) this.keys.connect();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.keys.disconnect();
  }
  update(changed) {
    super.update(changed);
  }
  firstUpdated() {
    this.dinput = this.shadowRoot.querySelector('#displayname');
    this.einput = this.shadowRoot.querySelector('#email');
    this.pinput = this.shadowRoot.querySelector('#password');
    this.rinput = this.shadowRoot.querySelector('#replica');
    this.minput = this.shadowRoot.querySelector('#remember');
    this.target = this.shadowRoot.querySelector('#page');
    //Key are in order send, cancel, next field, toggle remember, jump and select display name, jump and select email
    this.keys = new AppKeys(this.target, 'Enter Esc Tab F1 F2 F3'); 


  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`
      <app-waiting ?waiting=${this.waiting}></app-waiting>
      <app-page @key-pressed=${this._sendData} id="page">
        <h1>User Profile</h1>
        <p><strong>User Id: ${global.user.uid}</strong></p>
        <fancy-input id="displayname" label="Display Name" required value=${this.name}></fancy-input>

        <fancy-input
          label="E-Mail"
          .message=${this.email.length > 0 && this.email.indexOf('@') > 0 ? 'Email Not Known' : 'Required'}
          autofocus
          autocomplete="off"
          required
          type="email"
          name="email"
          id="email"
          .value="${this.email}"
          @value-changed="${this._emChanged}"></fancy-input>  

      </app-page>
    `;
  }
}
customElements.define('app-profile', AppProfile);