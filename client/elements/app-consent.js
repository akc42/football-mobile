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

import app from '../styles/app.js';
import button from '../styles/button.js';
import notice from '../styles/notice.js';
import {ConsentAccept} from '../modules/events.js';

/*
     <app-consent>: Standard for on privacy notice about cookies.
*/
class AppConsent extends LitElement {
  static get styles() {
    return [app, button, notice];
  }

  render() {
    return html`
      <style>
        @media (max-width: 400px) {
          :host {
            font-size: 0.7em;
          }
        }
      </style>
      <header><img src="../images/mb-logo.svg" height="64px"></header>
      <h1>Your Privacy</h1>
      <section class="intro">
        <p> We use cookies on this site for two purposes:-</p>
        <ol>
          <li>To know if you have visited before, in order to securely process pre-login functions.</li>
          <li>To remember your log-on details, to avoid you having to log on at each visit.</li>
        </ol>
        <p>Accepting this notice will allow us to use cookies for the first purpose. This cookie will expire in 90 days after your
          last visit. If you do not wish to accept, I am afraid we can proceed no further.</p>
        <p>You will have a separate opportunity to indicate your preference for the second purpose when you come to log on.</p>
      </section>
      <section class="action">          
        <button @click=${this._accept}>Accept visit tracking</button>
      </section>
    `;
  }
  _accept() {
    this.dispatchEvent(new ConsentAccept());
  }
}
customElements.define('app-consent', AppConsent);