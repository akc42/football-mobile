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
import { html } from '../libs/lit-element.js';
import {cache} from '../libs/cache.js';

import PageManager from './page-manager.js';
import { MenuReset } from '../modules/events.js';
import Route from '../modules/route.js';
import api from '../modules/api.js';
/*
     <fm-summary>
*/
class FmSummary extends PageManager {
  static get styles() {
    return [];
  }
  static get properties() {
    return {
      users: {type: Array}, //to hold full competitions cache result
      index: {type: Number}, //index into users array
      name: {type: Number} //competition name
    };
  }
  constructor() {
    super();
    this.users = [];

    this.index = -1;
    this.name = ''
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    if (changed.has('route') && this.route.active) {
        this.dispatchEvent(new MenuReset());
        this._newRoute();
    }

    super.update(changed);
  }
  firstUpdated() {
  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`
      <style>
        :host {
          height: 100%;
        }
      </style>
      ${cache({
        home: html`<fm-summary-display 
          .users=${this.users} 
          .name=${this.name} 
          @user-selected=${this._selectUser}></fm-summary-display>`,
        user: html`<fm-user-scores 
          .user=${this.index >= 0? this.users[this.index] : {uid:0,name:''}}></fm-user-scores>` 
      }[this.page])}
    `;
  }
  loadPage(page) {
    if (page === 'home') {
      import('./fm-summary-display.js');
    } else {
      import('./fm-user-scores');
    }

  }
  async _newRoute() {
    const response = await api('user/users_summary');
    this.users = response.users;
    this.name = response.name;
  }
}
customElements.define('fm-summary', FmSummary);