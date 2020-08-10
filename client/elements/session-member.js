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

import { SessionStatus } from '../modules/events.js';
import api from '../modules/api.js';
import global from '../modules/globals.js';

import './waiting-indicator.js';
import './fm-page.js';
import './re-captcha.js';


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
      waiting: {type: Boolean}
    };
  }
  constructor() {
    super();
    this.email='';
    this.waiting = false;
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
  }
  firstUpdated() {
    this.recapcha = this.shadowRoot.querySelector('re-captcha');
  }

  render() {
    return html`
      <style>

      </style>
      <waiting-indicator ?waiting=${this.waiting}></waiting-indicator>
      <fm-page heading="Membership">
        <re-captcha></re-captcha>      
        <p>Membership of ${global.organisationName} is not generally open to the public.  Instead it is a 4 step process as follows:-
          <ol>
            <li><p>We need to verify that you are the owner of the email address <strong>${this.email}</strong>.  We do this by sending that
            email address a link informing them that someone requested a membership.  If they click on that link to come back here to the next
            step, we can assume it is you.</p>  
            <p><strong>Please Check Now</strong> that his is your correct e-mail address before proceding as requests
            are limited (at least ${global.membershipRate} minutes between requests and no more than ${global.maxMembership} requests a month).  
            If this is not your correct e-mail address, just select Cancel and you can re-enter it (no need to pass robot test).</p>
            <p>If you are proceding you will need complete the robot test below</p></li>
            <li>We ask you to fill in a short note about who you are and why you want to join. After your email has been verified you can return
            at any time to change the wording on your application.</li>
            <li>Senior members of the organisation will periodically view a list of these applications and approve or reject them.</li>
            <li>You will be sent an e-mail informing you of their decision.  If positive it will contain a link to automatically sign you in (temporarily) and take you to a profile page where you can set up a user name and password for more permenant access.  You are then able to take part in the competitions</li>
          </ol>
          Please be aware that an approval may take some time and is not guarenteed.  
        </p>
        <button slot="action" cancel @click=${this._cancel}>Cancel</button>
        <button slot="action" @click=${this._proceed}>Proceed</button>  
      </fm-page>
    `;
  }
  _cancel (e) {
    e.stopPropagation();
    this.dispatchEvent(new SessionStatus({state: 'email'}));
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
  async _proceed(e) {
    e.stopPropagation();
    if(this.recapcha !== undefined && this.recapcha.validate()) {
      this.waiting = true;
      const response = await api('session/new_member_verify', {email: this.email, sid: sid});
      this.waiting = false;
      this.dispatchEvent(new SessionStatus({state: response.state, email:this.email}));
    }
  }

}
customElements.define('session-member', SessionMember);