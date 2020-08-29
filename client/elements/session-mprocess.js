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
console.log('starting imports')
import { LitElement, html } from '../libs/lit-element.js';



import './fm-input.js';
import button from '../styles/button.js';
import page from '../styles/page.js';

import { SessionStatus} from '../modules/events.js';
import global from '../modules/globals.js';
import './fm-page.js';
import AppKeys from '../modules/keys.js';

console.log('imports done')


/*
     <session-mprocess>: explains the membership process.
*/
class SessionMprocess extends LitElement {
  static get styles() {
    return [ button,page];
  }

  static get properties() {
    return {
      email: { type: String }
    };
  }

  constructor() {
    super();
    this.email = ''
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

  render() {
    return html`
      <style>

      </style>

      <fm-page heading="Membership Process">      
        
        <p>Membership of ${global.organisationName} is not generally open to the public.  Instead it is a 4 step process as follows:-
        </p>
          <ol>
            <li><p>We need to verify that you are the owner of the email address <strong>${this.email}</strong>.  We do this
            by sending that email address a link informing them that someone requested a membership.  If they click on that
            link to come back here to the next step, we can assume it is you.</p>  
            <p><strong>Please Check before proceeding</strong> that his is your correct e-mail address as requests
            are limited (at least ${global.membershipRate} minutes between requests and no more than ${global.maxMembership} requests a month).  
            If this is not your correct e-mail address, just select Cancel on the Membership form and you can re-enter it without using any of your limited requests.</p>
            <p>However, if you are proceding you will need complete the robot test and enter a password (twice) 
            of at least ${global.minPassLen} characters.</p></li>
            <li>After your email has been verified you can return and sign in again, using the password you entered in the first step, at any time to to word, or change, the reason you are applying.</li>
            <li>Senior members of the organisation will periodically view a list of these applications and approve or reject them.</li>
            <li>You will be sent an e-mail informing you of their decision.  If positive you will now be able to sign in. We recommend going to your profile page and reviewing and maybe updating your username.</li>
          </ol>
        <p>Please be aware that an approval may take some time and is not guarenteed.</p>
        <button slot="action" @click=${this._retry}>Return to Membership</button>  
      </fm-page>
    `;
  }

  _keyPressed(e) {
    if(e.key.combo === 'Enter') {
      this._retry;
      return true;
    }
    return false;
  }
  _retry(e) {
    e.stopPropagation();
    this.dispatchEvent(new SessionStatus({ state: 'member'}));
  }

}
customElements.define('session-mprocess', SessionMprocess);