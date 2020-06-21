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
import { classMap } from '../libs/class-map.js';
import { cache } from '../libs/cache.js';


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
class AppMember extends LitElement {
  static get styles() {
    return [ button, page];
  }
  static get properties() {
    return {
      email: {type: String},
      known: {type: Boolean}, //email is already a participant
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
    this.known = false;
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
    this.einput = this.shadowRoot.querySelector('#email');
    this.rinput = this.shadowRoot.querySelector('#reason');
    this.target = this.shadowRoot.querySelector('#page');
    this.keys = new AppKeys(this.target, 'Enter');
  }

  render() {
    return html`
      <style>

        #email {
          width: var(--email-input-length);
        }

        ol {
          margin-block-start:0.5rem;
          margin-block-end:0.3rem;

        }

        ol li {
          padding-inline-start: 0.5rem;
        }
        .step {
          background-color: lemonchiffon;
        }
        @media (max-height: 1000px) {

          ol {
            padding-inline-start:20px;
          }
         }

  

        @media (max-height: 600px) {
 
          ol {
            padding-inline-start:10px;
          }
        }



      </style>
      <app-waiting ?waiting=${this.waiting}></app-waiting>
      <app-page @key-pressed=${this._sendData} id="page" heading="Membership">
          <p>Applying for membership is a three step process.  You are currently at Step ${this.step} as highlighted below.</p>
          <ol>
            <li class=${classMap({step: this.step === 1})}>
            ${cache(this.step === 1 ? html`
            <p>We need to verify your email address.  When your enter you e-mail
            address and click on the "Verify Email" button we will send a link to that e-mail address which when you click on it,
            it will bring you back here to conduct step 2.</p>              
            <p>If you requested membership by mistake, just click the "Cancel" button and we return you to the previous page.</p>
              <div class="form">
                <fancy-input
                  label="E-Mail"
                  .message=${this.known? 'Email aready a member': (this.email.length > 0 && this.email.indexOf('@') > 0 ? 'Email ' : 'Required')}
                  autofocus
                  autocomplete="off"
                  required
                  type="email"
                  name="email"
                  id="email"
                  .value="${this.email}"
                  @value-changed="${this._emChanged}"></fancy-input>
              </div>  
            `:html`<p>Verify your email address</p>`)}</li>
            <li class=${classMap({step: this.step === 2})}><p>You request approval from the membership committee.</p>
            ${cache(this.step === 2 ? html`
            <p>In this step you enter a reason for becoming a member and click on the Request Approval button.</p>
              <div class="form">
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
                  @value-changed="${this._reasonChanged}"></fancy-input>
              </div>` : '')}           
            </li>
            <li class="${classMap({step: this.step === 3})}"><p>You wait for the membership committee to approve your request.  When approved you will be
            sent an e-mail telling you have been approved.</p>
            ${cache(this.step === 3 ? html`<p>This email will contain another link with a temporary password to enable to setup your profile. If, you received the link but were unable to act upon it with sufficient time, just click the "Resend Link" button.</p>
            <p>Requesting the link before you have been approved will have no effect, so just close the browser for now and wait.</p>`:'')}</li>
          </ol>
                  
          ${cache((this.step > 0 && this.step < 4) ? 
            html`<button slot="action" @click=${this._sendData}>${
              this.step === 1 ? 'Verify Email' : (this.step === 2 ? 'Request Approval': 'Resend Link')}</button>`:``)}
          <button slot="action" cancel @click=${this._cancel}>Cancel${this.step > 1 ? ' Membership Request':''}</button>
        
      </app-page>
    `;
  }

  _cancel(e) {
    e.stopPropagation();
    if (this.step > 1) {
      this.dispatchEvent(new SessionStatus({ type: 'cancelmem', email: this.email }));
    } else {
      this.dispatchEvent(new SessionStatus({type:'verify',email:this.email}));
    }
  }
  _emChanged(e) {
    this.email = e.changed;
    this.known = false;
  }
  _reasonChanged(e) {
    this.reason = e.changed;
  }
  async _sendData() {
    this.waiting = true;
    switch (this.step) {
      case 1:
          if (!this.einput.invalid) {
            const data = await api('session/new_member_verify',{ email: this.email });
            if (data.known) {
              this.known = true;
              this.einput.invalid = true;
            } else {
              this.dispatchEvent(new SessionStatus({ type: 'await', email: this.email }));
            }
          }
        break;
      case 2:
        if (!this.rinput.invalid) {
          const data = await api('session/ask_approve',{uid: global.user.uid});
          if (data) {
            global.user = data.user;
            this.dispatchEvent(new SessionStatus({type: 'memberpin',email: data.user.email}));
          } else {
            this.dispatchEvent(new SessionStatus({type: 'verify', email: ''}));
          }
        }
        break;
      case 3:
        const data = await api('session/new_member_pin', { uid: global.user.uid });
        if (data) {
          this.dispatchEvent(new SessionStatus({ type: 'await', email: '' }));
        }
        break;
      default:
    }
    this.waiting = false;
  }


}
customElements.define('app-member', AppMember);