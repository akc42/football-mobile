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

import { SessionStatus } from '../modules/events.js';


import './fm-page.js';
import AppKeys from '../modules/keys.js';




/*
     <Session expired>: Displays an Error Message when A Pin token has expired.
*/
class SessionExpired extends LitElement {
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

      <fm-page heading="Link Expired">      
        <p>Sadly the link that we sent you that you have just tried to use has either expired or been corrupted in some way.
        We are sorry, but because of that we are unable to identify you. If you wish to try again, just click on the Retry Button below.</p>
        <button slot="action" @click=${this._retry}><material-icon>reply</material-icon> Retry</button>  
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
customElements.define('session-expired', SessionExpired);