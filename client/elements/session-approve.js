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
import { WaitRequest} from '../modules/events.js';
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
      user: {type: Object},
      reason: {type: String}
    };
  }
  constructor() {
    super();
    this.user = {uid:0};
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
    if (this.doneFirstCall) api('session/read_reason', { uid: this.user.uid }).then(response => this.reason = response.reason);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.keys.disconnect();
    document.body.removeEventListener('key-pressed', this._keyPressed);
  }
  firstUpdated() {
    this.doneFirstCall = true;
    this.dispatchEvent(new WaitRequest(true));
    api('session/read_reason', { uid: this.user.uid }).then(response => {
      this.reason = response.reason;
      this.dispatchEvent(new WaitRequest(false));
    });
  }

  render() {
    return html`
      <style>

      </style>
      <fm-page heading="Application">
        <fm-input 
          id="reason" 
          textArea 
          autofocus
          label="Application Reason" 
          .value=${this.reason} 
          @value-changed=${this._valueChange} 
          rows="6" 
          cols="30"></fm-input>
        <p>Your application for membership is available for the senior members of ${global.organisationName} to view.</p>
        <p>You may update this application at anytime to provide a short reason as to why you want to become a member. So feel free to enter or revise the text below.</p>
        
        <button slot="action" @click=${this._update}>Update</button>
        
      </fm-page>
    `;
  }

  _keyPressed(e) {
    if (e.key === 'Enter') {
      this._update(e);
      return true;
    }
    return false;
  }
  async _update(e) {
    this.dispatchEvent(new WaitRequest(true));
    const result =  await api('session/update_reason',{uid: this.user.uid, reason: this.reason});
    this.dispatchEvent(new WaitRequest(false));
    if (result.state === 'error') {
      throw new Error ('Reason Update Failed');
    }

  }
  _valueChange(e) {
    this.reason = e.changed;
  }



}
customElements.define('session-approve', SessionApprove);