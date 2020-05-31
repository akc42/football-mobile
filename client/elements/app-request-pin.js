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
import user from '../modules/user/js';
import './app-waiting.js';



/*
     <app-email-verify>: Collects, Email Address and Verifies against our participant database.
*/
class AppRequestPin extends LitElement {
  static get styles() {
    return [app, button, notice];
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
        <h2>${user.name}</h2>
        <p>We are going to send you via email to <em>${user.email}</em> a link which will temporarily (for the next 12 hours) automatically log you on to this web site, to enable you to reset your password.  Please only continue if this e-mail above is yours.</p>
        <p> Unfortunately if you have already changed your e-mail address and the address will not allow you to receive the link, then you will have to cancel this action to return to the previous page, where you can enter your new email address and request membership.</p>     

      </section>
      <section class="action">          
        <button @click=${this._sendLink}>Send Me the Link</button>
        <button cancel @click=${this._cancel}>Cancel</button>
      </section>
    `;
  }
  _cancel() {

  }

}
customElements.define('app-request-pin', AppRequestPin);