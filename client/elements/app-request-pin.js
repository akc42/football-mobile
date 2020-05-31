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
import './send-button.js';
import app from '../styles/app.js';
import button from '../styles/button.js';
import notice from '../styles/notice.js';
import { EmailStatus } from '../modules/events.js';
import api from '../modules/api.js';
import './app-waiting.js';



/*
     <app-email-verify>: Collects, Email Address and Verifies against our participant database.
*/
class AppRequestPin extends LitElement {
  static get styles() {
    return [app, button, notice];
  }
  static get properties() {
    return {
      user: {type: String},
      waiting: {type: Boolean}
    };
  }
  constructor() {
    super();
    this.email = '';
    t
  }

  firstUpdated() {
    this.input = this.shadowRoot.querySelector('#email');
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
      <header><img src="../images/mb-logo.svg" height="64px"></header>
      
      <section class="intro">
        <p></p>     

      </section>
      <section class="action">          
        <send-button @click=${this._sendData}>Request Password Code</send-button>
      </section>
    `;
  }
  _emChanged(e) {
    this.email = e.changed;
    this.pending = false;
  }

  _newMember(e) {
    e.stopPropagation();
    if (!this.input.invalid) this.dispatchEvent(new EmailStatus({type:'membershipreq',email:this.email}));
  }

  async _sendData() {
    if (!this.input.invalid) {
      this.waiting = true;
      const response = await api('session/verifyemail',{email:this.email});
      this.waiting = false;
      if (response.state === 'found') {
          if (response.user.waiting_email != 0 && response.user.email !== this.email) {
            this.pending = true;
            this.input.invalid = true;
          } else {
            this.dispatchEvent(new EmailStatus({type: 'matched', email: this.email, user: response.user}));
          }
      } else {
        this.input.invalid = true;
      }
    } 

  }
}
customElements.define('app-request-pin', AppRequestPin);