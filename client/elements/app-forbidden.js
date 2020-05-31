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
class AppForbidden extends LitElement {
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
      <h1>Something Went Wrong</h1>
      <section class="intro">
        <p>We are sorry but something has gone wrong with the operation of the site.  The problem has been logged with the server and it will be dealt with soon.</p>
        <p>You may wish to e-mail the web master (${this.webmaster}) to let them know what is wrong</p> 
      </section>

    `;
  }

}
customElements.define('app-forbidden', AppForbidden);