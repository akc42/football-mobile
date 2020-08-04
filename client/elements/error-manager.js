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
import { LitElement, html, css } from '../libs/lit-element.js';
import {cache} from '../libs/cache.js';
import {SessionStatus, AuthChanged, LocationAltered } from "../modules/events.js";
import './fm-page.js';
import api from '../modules/api.js';
import button from '../styles/button.js';
import page from '../styles/page.js';
import global from '../modules/globals.js';

/*
     <error-manager>: a page which handles errors.
*/
class ErrorManager extends LitElement {
  static get styles() {
    return [button, css`
      .forbidden {
        color: red;
        font-weight: bold;
      }
    `, page];
  }
  static get properties() {
    return {
      anError: {type: Boolean},
      forbidden: {type: Boolean},
    };
  }

  constructor() {
    super();

    this.anError = false;
    this.forbidden = false;
    this._clientError = this._clientError.bind(this);
    this._serverError = this._serverError.bind(this);
    this._promiseRejection = this._promiseRejection.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('error', this._clientError);
    window.addEventListener('api-error', this._serverError);
    window.addEventListener('unhandledrejection', this._promiseRejection);
    this.forbidden = false;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('error', this._clientError);
    window.removeEventListener('api-error', this._serverError);
    window.removeEventListener('unhandledrejection', this._promiseRejection);

  }
  render() {
    return html`
      ${cache(this.anError?html`
        <fm-page .heading=${this.forbidden?'Forbidden': 'Something Went Wrong'}>
          ${cache(this.forbidden ? html`
            <p class="forbidden">You have tried to access a forbidden area.</p>
          `:html`
            <p>We are sorry but something has gone wrong with the operation of the site.  The problem has been logged
            with the server and it will be dealt with soon.</p>
            <p>Nevertheless, you may wish to e-mail the web master (<a href="mailto:${global.webmaster}">${global.webmaster}</a>) to let
            them know that there has been an issue.</p>             
            <button slot="action" @click=${this._reset}>Restart</button>
          `)}
        </fm-page>
      `: '')}
    `;
  }
  _clientError(e) {
    if (this.anError) return;
//    e.preventDefault();
    const message = `Client Error:
${e.error.stack}
has occured`;
    api('session/log', {type:'Error', message: message});
    this.dispatchEvent(new SessionStatus({type:'error'}));
    this.anError = true;
  }
  _promiseRejection(e) {
    if (this.anError) return;
//   e.preventDefault();
    const possibleError = e.reason;

    if (possibleError.type === 'api-error') {
      this._serverError(possibleError)
    } else {
      const message = `Client Error: Uncaught Promise Rejection with reason ${e.reason} has occured`;
      api('session/log', { type: 'Error', message: message });
      this.dispatchEvent(new SessionStatus({ type: 'error' }));
      this.anError = true;
    }
  }
  _reset() {
    this.anError = false;
    this.forbidden = false;
    this.dispatchEvent(new SessionStatus({type:'reset'}));
  }
  _serverError(e) {
    if (this.anError) return;
//    e.preventDefault();
    //put us back to home
    window.history.pushState({}, null, '/');
    window.dispatchEvent(new LocationAltered());
    if (e.reason === 403) {
      //unauthorised so log off
      window.dispatchEvent(new AuthChanged(false));
      this.forbidden=true;

    }
    this.dispatchEvent(new SessionStatus({type: 'error'}));
    this.anError = true;
  }


}
customElements.define('error-manager', ErrorManager);