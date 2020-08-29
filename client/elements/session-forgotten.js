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
import './fm-page.js';
import './re-captcha.js';

import button from '../styles/button.js';
import page from '../styles/page.js';
import { SessionStatus, WaitRequest } from '../modules/events.js';
import api from '../modules/api.js';
import AppKeys from '../modules/keys.js';
import global from '../modules/globals.js';



/*
     <session-forgotten>: Allows a user to make Request Pin.
*/
class SessionForgotten extends LitElement {
  static get styles() {
    return [ button, page];
  }
  static get properties() {
    return {
      user: {type: Object}
    };
  }
  constructor() {
    super();
    this.user = {uid:0, email:''}
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
  }
  update(changed) {
    if (changed.has('email') && this.email.length > 0) {
      api('session/read_reason', {email: this.email}).then;
    }
    super.update(changed);
  }
  firstUpdated() {
    this.application = this.shadowRoot.querySelector('#reason');
    this.recaptcha = this.shadowRoot.querySelector('re-captcha');
  }

  render() {
    return html`
      <style>

      </style>
      <fm-page heading="Forgotten">
          <re-captcha></re-captcha>
          <p>You have indicated that you have forgotton your password.  Please prove you a not a robot, and then we
          will send an email to <strong>${this.user.email}</strong> with a link that will enable you to access your profile
          and reset your password.</p>
         
          <button slot="action" @click=${this._update}>Send Link</button>
        
      </fm-page>
    `;
  }

  _keyPressed(e) {
    if (e.key.combo === 'Enter') {
      this._update(e);
      return true;
    }
    return false;
  }
  async _update(e) {
    if (this.recaptcha !== undefined && this.recaptcha.validate()) {
      this.dispatchEvent(new WaitRequest(true));
      await api('session/request_pin',{uid: this.user.uid });
      this.dispatchEvent(new WaitRequest(false));
      this.dispatchEvent(new SessionStatus({state: 'pin'}));
    }
  }
  _valueChange(e) {
    this.reason = e.changed;
  }



}
customElements.define('session-forgotten', SessionForgotten);