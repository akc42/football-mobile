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
import './waiting-indicator.js';
import button from '../styles/button.js';
import page from '../styles/page.js';
import { SessionStatus } from '../modules/events.js';
import api from '../modules/api.js';
import AppKeys from '../modules/keys.js';
import global from '../modules/globals.js';



/*
     <session-approve>: Allows a user to make his membership application pending approval.
*/
class SessionApprove extends LitElement {
  static get styles() {
    return [ button, page];
  }
  static get properties() {
    return {
      email: {type: String},
      reason: {type: String},
      uid: {type: Number},
      waiting: {type: Boolean}
    };
  }
  constructor() {
    super();
    this.email = '';
    this.waiting = false;
    this.reason = '';
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
      <waiting-indicator ?waiting=${this.waiting}></waiting-indicator>
      <fm-page heading="Approval">
          <re-captcha></re-captcha>
          <p>Your application for membership is available for the senior members of ${global.organisationName} to view.</p>
          <p>You may update this application at anytime to provide a short reason as to why you want to become a member. So feel free to enter or revise the text below.</p>
          <fm-input id="reason" textArea label="Application Reason" .value=${this.reason} @value-changed=${this._valueChange}></fm-input>
          <p>Because you have not had to add any kind of password to reach here, and provided you don't request this more than once every ${global.rateLimit} minutes, an email will be sent to your email address 
          (<strong>${this.email}</strong>) with a link to confirm the update.</p>
          <p>You will not be able to send the e-mail until you have confirmed you are not a robot.</p>
         
          <button slot="action" @click=${this._update}>Send Email</button>
        
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
      this.waiting = true;
      
      await api('session/member_reason_update',{uid: this.uid, email: this.email, reason: this.reason});
      this.waiting = false;
      this.dispatchEvent(new SessionStatus({state: 'pin'}));
    }
  }
  _valueChange(e) {
    this.reason = e.changed;
  }



}
customElements.define('session-approve', SessionApprove);