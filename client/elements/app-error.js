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
import {cache} from '../libs/cache.js';

import './app-page.js';
import { SessionStatus } from '../modules/events.js';
import api from '../modules/api.js';
import button from '../styles/button.js';


/*
     <app-consent>: Standard for on privacy notice about cookies.
*/
class AppError extends LitElement {
  static get styles() {
    return [button];
  }
  static get properties() {
    return {
      webmaster: {type: String},
      anError: {type: Boolean}
    };
  }

  constructor() {
    super();
    this.webmaster = '';
    this.anError = false
    this._clientError = this._clientError.bind(this);
    this._serverError = this._serverError.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('error', this._clientError);
    window.addEventListener('api-error', this._serverError);

  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('error', this._clientError);
    window.removeEventListener('api-error', this._reset);
  }
  render() {
    return html`
      <style>
        @media (max-width: 400px) {
          :host {
            font-size: 1.3em;
          }
        }
      </style>
      ${cache(this.anError?html`
        <app-page>
          <h1>Something Went Wrong</h1>
          <section class="intro">
            <p>We are sorry but something has gone wrong with the operation of the site.  The problem has been logged 
            with the server and it will be dealt with soon.</p>
            <p>Nevertheless, you may wish to e-mail the web master (<a href="mailto:${this.webmaster}">${this.webmaster}</a>) to let
            them know that there has been an issue.</p> 
          </section>
          <button slot="action" @click=${this._reset}>Restart</button>
        </app-page>
      `: '')}
    `;
  }
  _clientError(e) {
      const message = `Client Error:
${e.error.stack}
has occured`;
      api('/session/log', {type:'Error', message: message});
      this.dispatchEvent(new SessionStatus({type:'error'}));
      this.anError = true;
  }
  _reset() {
    this.anError = false;
    this.dispatchEvent(new SessionStatus({type:'reset'}));
  }
  _serverError(e) {
    if (e.status === 'error');
    this.dispatchEvent(new SessionStatus({type: 'error'}));
    this.anError = true;
  }


}
customElements.define('app-error', AppError);