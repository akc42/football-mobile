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
import { setUser } from '../modules/user.js';



/*
     <app-email-verify>: Collects, Email Address and Verifies against our participant database.
*/
class AppEmailVerify extends LitElement {
  static get styles() {
    return [app, button, notice];
  }
  static get properties() {
    return {
      email: {type: String},
      waiting: {type: Boolean},
      pending: {type: Boolean}
    };
  }
  constructor() {
    super();
    this.email = '';
    this.pending = false;
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
        <p>Welcome back to <strong>Melinda's Backups Football Results Picking Competition</strong>.  This 
        appears to be your first visit to the site since we re-opened with this new version of software.
        We have renamed it <em>Football Mobile</em> because it has been designed so you can use it on 
        your mobile phone if you wish. Sadly, with no forum available, you will be have to provide your 
        email address and later your password but, with your permission, we can remember you
        so you won't have to.</p>

        <p>If you still have the same e-mail address since the last time you registered and played with us,
        enter it below.  However, if you are new to Melinda's Backups or you have changed your e-mail address since
        you last played in the competition, please enter it here and then please request Membership.</p>

        <p>New members please note that this Competiion is for Melinda's Backups only, and once we have verified your
        email address we will ask you for a short note to explain to the Membership Committee why you should be admitted to the membership. You will then have to wait for approval.</p>     
        <fancy-input
          label="E-Mail"
          .message=${this.email.length > 0 && this.email.indexOf('@') > 0 ? 
            (this.pending?'E-mail not approved yet' :'Email Not Known') : 'Required'}
          autofocus
          autocomplete="off"
          required
          type="email"
          name="email"
          id="email"
          .value="${this.email}"
          @value-changed="${this._emChanged}"></fancy-input>  
      </section>
      <section class="action">          
        <send-button @click=${this._sendData}>Verify</send-button>
        <button cancel @click=${this._newMember}>Request Membership</button>
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
            setUser(response.user);
            this.dispatchEvent(new EmailStatus({type: 'matched', email: this.email}));
          }
      } else {
        this.input.invalid = true;
      }
    } 

  }
}
customElements.define('app-email-verify', AppEmailVerify);