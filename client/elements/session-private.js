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
import {unsafeHTML} from '../libs/unsafe-html.js';


import './fm-input.js';
import button from '../styles/button.js';
import page from '../styles/page.js';

import { SessionStatus } from '../modules/events.js';
import global from '../modules/globals.js';
import './waiting-indicator.js';
import './fm-page.js';
import AppKeys from '../modules/keys.js';




/*
     <session-private>: contains the privacy Policy.
*/
class SessionPrivate extends LitElement {
  static get styles() {
    return [ button,page];
  }

  constructor() {
    super();
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

      <fm-page heading="Privacy Notice">      
        
        <p>${global.organisationName} privacy policy explains how we use the data collected at
        this site.  We collect the following data:-
        <ul>
          <li>Your e-mail address, which will be coupled with your chosen user name
          (which does not need to be your real name).</li> 
          <li>Your entries into Competitions hosted on this site, and details of all picks made.  These will
          be available to all approved members of this site</li>
        </ul> 
          This is stored in a file on the server which hosts the competitions.
          Access is only available to the webmaster. We will only use the data for the
          purpose of running the competitions.  We will not pass it to third parties or
          use it for Marketing.</p> 
        <p>We use a single cookie stored on your computer to technically manage
        your navigation of this site.  <strong>You</strong> can decide whether we delete
        this cookie when you finish using the site (in which case you will have to sign
        in on the next visit), or whether you want us to retain it so that you are
        automatically signed in on the next visit</p>
        <button slot="action" @click=${this._retry}>Return To Email</button>  
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
    this.dispatchEvent(new SessionStatus({ state: 'email'}));
  }

}
customElements.define('session-private', SessionPrivate);