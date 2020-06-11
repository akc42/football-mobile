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
import global from '../modules/globals.js';



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
      reason: {type: String},
      waiting: {type: Boolean},
      step:{type: Number}
    };
  }
  constructor() {
    super();
    this.email = '';
    this.waiting = false;
    this.step = 1;
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
          <h1> Applying for Membership</h1>
       
          <p>Applying for membership is a three step process.  You are currently at Step ${this.step} as highlighted below.</p>

          <ol>
          <li class=${classMap({step: this.step === 1})}><p>We need to verify your email address.  When your enter you e-mail
          address and click on the "Verify Email" button we will send a link to that e-mail address which when you click on it,
          it will bring you back here to conduct step 2.</p>

          ${cache(this.step === 1 ? html`
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
          `:'')}</li>
            <li class=${classMap({step: this.step === 2})}><p>Membership has to be approved by a member of the membership committee.  In this
            step you enter a reason for becoming a member and click on the Request Approval button.</p>
            ${cache(this.step === 2 ? html`
             <fancy-input
              label="Reason"
              .message=${'Reason Required'}
              autofocus
              textArea
              autocomplete="off"
              required
              name="reason"
              id="reason"
              .value="${this.reason}"
              @value-changed="${this._reasonChanged}"></fancy-input>` : '')}           
            </li>
            <li class="${classMap({step: this.step === 3})}"><p>You await a decision by the membership committee.  When approved you will be
            sent an e-mail telling you have been approved and with another link (which will expires in ${global.verifyExpires} hours of it having
            been sent).  If, you 
            received the link but were unable to act upon it with sufficient time, just click the "Resend Link" button.</p></li>

            </ol>


                  
          ${cache((this.step > 0 && this.step < 4) ? 
            html`<button slot="action" @click=${this._sendData}>${
              this.step === 1 ? 'Verify Email' : (this.step === 2 ? 'Request Approval': 'Resend Link')}</button>`:``)}
          <button slot="action" cancel @click=${this._cancel}>Cancel</button>
        
      </app-page>
    `;
  }

  _cancel(e) {
    e.stopPropagation();
    if (!this.input.invalid) this.dispatchEvent(new SessionStatus({type:'verify',email:this.email}));
  }
  _emChanged(e) {
    this.email = e.changed;
    this.pending = false;
  }
  _reasonChanged(e) {
    this.reason = e.changed;
  }
  async _sendData() {
    if (!this.input.invalid) {
      this.waiting = true;
      const response = await api('session/requestpin',{email:this.email});
      this.waiting = false;
      if (response.data.found) {
        const type = response.data.password? (response.data.remember? 'markrem': 'markpass'): 'await';
        this.dispatchEvent(new SessionStatus({type: type, email: this.email}));
        this.email = '';
      } else {
        this.input.invalid = true;
      } 
    } 

  }
  async _throwError403(e) {
    const response = await api('return_403');
    console.log('403 response =',response);
  }
  async _throwError500(e) {
    const response = await api('return_500');
    console.log('500 response =', response);
  }
  

}
customElements.define('app-email-verify', AppEmailVerify);