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

import api from '../modules/api.js';
import global from '../modules/globals.js';

import {WaitRequest} from '../modules/events.js';
import './football-page.js';
import './date-format.js';
import './material-icon.js';
import page from '../styles/page.js';
import button from '../styles/button.js';

import { switchPath } from '../modules/utils.js';

/*
     <fm-register>
*/
class RegisterManager extends LitElement {
  static get styles() {
    return [page, button];
  }
  static get properties() {
    return {
      condition: {type: String},
      agreed: {type: Number} 
    };
  }
  constructor() {
    super();
    this.condition = '';
    this.agreed = 0;
  }
  connectedCallback() {
    super.connectedCallback();
    this._fetchCondition();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    super.update(changed);
  }
  firstUpdated() {
  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`
        <football-page id="page" heading="Registration">
          ${cache(this.agreed === 0 ? html`
            <p>This competition is now accepting Registrations.  If you wish to register please read the following condition and
              then press the "Agree" button</p>
            <p>${this.condition}</p>
            <button slot="action" @click=${this._register}>I Agree</button>          
          ` : html`
            <p>You are already registered for this competition.  You did so at <date-format withTime .date=${this.agreed}></date-format>.</p>
            <p>Click on the button below to return to the Home Page</p>
            <button slot="action" @click=${this._goHome}><material-icon>home</material-icon> Home Page</button>
          `)}

        </football-page>
    `;
  }
  async _fetchCondition() {

    this.dispatchEvent(new WaitRequest(true));
    const response = await api(`user/${global.cid}/registration_condition`);
    this.dispatchEvent(new WaitRequest(false));
    if (response.open === 1) {
      this.condition = response.condition;
      this.agreed = response.agreed;

    } else {
      switchPath(`/`);
    }

  }
  _goHome(e) {
    e.stopPropagation();
    switchPath(`/`);
  }
  async _register(e) {
    e.stopPropagation();
    this.dispatchEvent(new WaitRequest(true));
    await api(`user/${global.cid}/register`);
    this.dispatchEvent(new WaitRequest(false));
    switchPath('/');


  }
}
customElements.define('register-manager', RegisterManager);