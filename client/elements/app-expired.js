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
import AppKeys from '../modules/keys.js';




/*
     <app-email-verify>: Collects, Email Address and Verifies against our participant database.
*/
class AppExpired extends LitElement {
  static get styles() {
    return [ button,page];
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
  render() {
    return html`
      <style>
        #email {
          width: var(--email-input-length);
        }
        p {
          font-size: 1.3em;
        }
        @media (max-height: 1300px) {
          p {
            font-size:1em;
          }

        }
        @media (max-height: 1000px) {
          p {
            font-size: 0.7em;
          }
        }

        @media (max-height: 700px) {
          p {
            font-size: 0.5em;
          }
        }

        @media (max-height: 600px) {
          p {
            font-size: 0.45em;
          }
        }



      </style>
      <app-waiting ?waiting=${this.waiting}></app-waiting>
      <app-page>
        
        <section class="intro">
          <p>Sadly the link that we sent you that you have just tried to use as either expired or been corrupted in some way.
          We are sorry, but because of that we are unable to identify you. If you wish to try again, please enter you email
          address below and request a new link.</p>

          <p>If you don't think you need a new link and can log in normally, just hit the cancel button below (or press the escape key)</p>     
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
        </section>
        <section slot="action">          
          <button @click=${this._sendData}>Resend Link</button>
          <button cancel @click=${this._logon}>Cancel</button>
        </section>
      </app-page>
    `;
  }
  _emChanged(e) {
    this.email = e.changed;
    this.pending = false;
  }
  _keyPressed(e) {
    if(e.key.combo === 'Enter') {
      this._sendData();
      return true;
    } else if (e.key.combo === 'Esc') {
      this._logon();
      return true;
    }
    return false;
  }
  _logon() {
    this.dispatchEvent(new SessionStatus({type:'logon'}));
  }
  async _sendData() {
    if (!this.input.invalid) {
      this.waiting = true;
      const response = await api('session/requestpin',{email:this.email});
      this.waiting = false;
      if (response.data.found) {
        this.dispatchEvent(new SessionStatus({type: response.data.password? 'markpass': 'await', email: this.email}));
        this.email = '';
      } else {
        this.input.invalid = true;
      } 
    } 

  }
}
customElements.define('app-expired', AppExpired);