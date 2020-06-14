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
class AppEmailVerify extends LitElement {
  static get styles() {
    return [ button, page];
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
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.keys !== undefined) this.keys.connect();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.keys.disconnect();
  }
  firstUpdated() {
    this.input = this.shadowRoot.querySelector('#email');
    this.target = this.shadowRoot.querySelector('#page');
    this.keys = new AppKeys(this.target, 'Enter');
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
            font-size:1.3em;
          }

        }
        @media (max-height: 1000px) {
          p {
            font-size: 1.0em;
          }
        }

        @media (max-height: 700px) {
          p {
            font-size: 0.9em;
          }
        }

        @media (max-height: 600px) {
          p {
            font-size: 0.7em;
          }
        }



      </style>
      <app-waiting ?waiting=${this.waiting}></app-waiting>
      <app-page @key-pressed=${this._sendData} id="page">
        
        <section class="intro">
          <p>If you still have the same e-mail address since the last time you registered and played with us,
          enter it below.  However, if you are a new visitor or you have changed your e-mail address since
          you last played in the competition, please enter it here and then request Membership.</p>

          <p>New members please note that this Competiion is for Members only, and once we have verified your
          email address we will ask you for a short note to explain to the Membership Committee why you should be admitted. 
          You will then have to wait for approval while they review your application.</p>     
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
          <button @click=${this._sendData}>Verify</button>
          <button cancel @click=${this._newMember}>Request Membership</button>
        </section>
      </app-page>
    `;
  }
  _emChanged(e) {
    this.email = e.changed;
    this.pending = false;
  }

  _newMember(e) {
    e.stopPropagation();
    if (!this.input.invalid) this.dispatchEvent(new SessionStatus({type:'membershipreq',email:this.email}));
  }

  async _sendData() {
    if (!this.input.invalid) {
      this.waiting = true;
      const data = await api('session/request_pin',{email:this.email});
      this.waiting = false;
      if (data.found) {
        const type = data.password? (data.remember == 1? 'markrem': 'markpass'): 'await';
        this.dispatchEvent(new SessionStatus({type: type, email: this.email}));
        this.email = '';
      } else {
        this.input.invalid = true;
      } 
    } 

  }
}
customElements.define('app-email-verify', AppEmailVerify);