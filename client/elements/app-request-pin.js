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
import page from '../styles/page.js';
import button from '../styles/button.js';

import { EmailStatus } from '../modules/events.js';
import api from '../modules/api.js';
import './app-waiting.js';
import './app-page.js';
import global from '../modules/globals.js';


/*
     <app-email-verify>: Collects, Email Address and Verifies against our participant database.
*/
class AppRequestPin extends LitElement {
  static get styles() {
    return [button,page];
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
      <app-page .heading=${global.user.name}>
          <p>We are going to send you (via email) a link which will temporarily (for the next ${global.verifyExpires} hours) automatically 
           enable you access your profile page to reset your password. You will then be redirected to the log on page where you should 
          then formally log on with that new password.</p>  
          <p>The email address we will use is <em>${user.email}</em>. Please only continue if this e-mail address is yours.</p>
          <p> Unfortunately if you have already changed your e-mail address and this address will not allow you to
          receive the link, then you will have to cancel this action to return to the previous page, where
          you can enter your new email address and request membership instead.</p>                   
        <button slot="action" @click=${this._sendLink}>Send Me the Link</button>
        <button slot="action" cancel @click=${this._cancel}>Cancel</button> 
      </app-page>
    `;
  }
  _cancel() {
    this.dispatchEvent(new EmailStatus({type:'cancelpin', email:user.email}));
  }
  async _sendLink() {
    const response = await api('session/sendpin',{email:user.email})
    this.dispatchEvent(new EmailStatus({type:'sentpin', email:user.email}));
  }

}
customElements.define('app-request-pin', AppRequestPin);