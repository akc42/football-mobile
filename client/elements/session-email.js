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


import './fm-input.js';
import button from '../styles/button.js';
import page from '../styles/page.js';
import { SessionStatus, WaitRequest } from '../modules/events.js';
import global from '../modules/globals.js';
import './fm-page.js';
import AppKeys from '../modules/keys.js';
import api from '../modules/api.js';





/*
     <session email>: Collects an Email Address and verifies against our participant database.
*/
class SessionEmail extends LitElement {
  static get styles() {
    return [ button, page];
  }
  static get properties() {
    return {
      email: {type: String},
      donefirst: {type: Boolean}
    };
  }
  constructor() {
    super();
    this.email = '';
    this.donefirst = false;
    this._keyPressed = this._keyPressed.bind(this);

  }
  connectedCallback() {
    super.connectedCallback();
    this.donefirst = false;
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
      <fm-page heading="Welcome">
        <fm-input 
          id="email" 
          name="email" 
          type="email" 
          autofocus 
          ?required=${this.donefirst} 
          label="Email" 
          message="Valid Email Address Required" @blur=${this._doneFirst}></fm-input>
        <button slot="action" @click=${this._continue}>Continue <material-icon>navigate_next</material-icon></button>
        <p>By continuing you agree to ${global.organisationName} <a href="#" @click=${this._privacy}>Privacy Policy</a></p>
      </fm-page>
    `;
  }
  async _continue(e) {
    e.stopPropagation();
    if (this.input !== undefined && this.input.validate()) {
      this.email = this.input.value;
      this.dispatchEvent(new WaitRequest(true));
      const response = await api('session/email_verify',{email: this.email});
      this.dispatchEvent(new WaitRequest(false));
      if (response.state !== 'error') {
        if (response.user !== undefined) {
          this.dispatchEvent(new SessionStatus({ state: response.state, user: response.user }));
        } else {
          this.dispatchEvent(new SessionStatus({ state: response.state, email: response.email }));
        }
      } else {
        throw new Error('Email Verify Failed ')
      }
    }
  }
  _doneFirst(e) {
    e.stopPropagation();
    this.donefirst = true;
  }
  _keyPressed(e) {
    if (e.key === 'Enter') {
      this._continue(e); 
      return true;
    }
    return false;
  }
  _privacy(e) {
    e.preventDefault();
    e.stopPropagation();
    this.dispatchEvent(new SessionStatus({state: 'private'}));
  }
}
customElements.define('session-email', SessionEmail);