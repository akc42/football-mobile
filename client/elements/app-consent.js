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
import {unsafeHTML} from '../libs/unsafe-html.js';

import './app-page.js';

import button from '../styles/button.js';
import page from '../styles/page.js';

import AppKeys from '../modules/keys.js';
import {SessionStatus} from '../modules/events.js';
import global from '../modules/globals.js';

/*
     <app-consent>: Standard for on privacy notice about cookies.
*/
class AppConsent extends LitElement {
  static get styles() {
    return [button, page];
  }

  constructor() {
    super();
    global.ready.then(() => this.requestUpdate());
    this._accept = this._accept.bind(this);

  }
  connectedCallback() {
    super.connectedCallback();
    document.body.addEventListener('key-pressed', this._accept);
    if (this.keys === undefined) {
      this.keys = new AppKeys(document.body, 'Enter');
    } else {
      this.keys.connect();
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.keys.disconnect();
    document.body.removeEventListener('key-pressed', this._accept);
  }


  render() {
    return html`
      <style>
        ol {
          margin-block-start:0.5rem;
          margin-block-end:0.3rem;

        }

        ol li {
          padding-inline-start: 0.5rem;
        }

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
      <app-page title="Your Privacy">
        <p>${unsafeHTML(global.firstTimeMessage)}</p>

        <p> We use cookies on this site for two purposes:-</p>
        <ol>
          <li>To know if you have visited before, in order to securely process pre-login functions.</li>
          <li>To remember your log-on details, to avoid you having to log on at each visit.</li>
        </ol>
        <p>Accepting this notice will allow us to use cookies for the 1st purpose only. This cookie will expire in 90 days after your
          last visit. If you do not wish to accept, I am afraid we can proceed no further.</p>
        <p>You will have an opportunity to indicate your preference for the 2nd purpose when you come to log on.</p>
                
        <button slot="action" @click=${this._accept}>Accept visit tracking</button>
      </app-page>
    `;
  }
  _accept() {
    this.dispatchEvent(new SessionStatus({type:'consent'}));
  }
}
customElements.define('app-consent', AppConsent);