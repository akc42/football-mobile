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
import { MenuReset, MenuAdd } from '../modules/events.js';
import Route from '../modules/route.js';
import api from '../modules/api.js';
import { switchPath } from '../modules/utils.js';
import Debug from '../modules/debug.js';
const debug = new Debug('summary');

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
    this.uRouter = new Route('/:uid','page:user');
    this.fetchdataInProgress = false;
  }
  connectedCallback() {
    this.fetchdataInProgress = false;
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
    if (changed.has('subRoute') && this.subRoute.active) {
      const uidR = this.uRouter.routeChange(this.subRoute);
      if (uidR.active) {
        this.dispatchEvent(new MenuAdd('close'));
         if (!this.fetchdataInProgress) {
            this.index = this.users.findIndex(user => user.uid === uidR.params.uid);
            debug('no fetch happening, find index for ' + uidR.params.uid + ' as ' + this.index);
            if (this.index < 0) switchPath('/summary');
         } else {
           debug('fetch in progress, delayed index setting');
         }
      } else {
        switchPath('/summary');
      }
    }
    if(changed.has('users') && this.subRoute.active) {
      debug('users changed (as a result of fetching?')
      const uidR = this.uRouter.routeChange(this.subRoute);
      if (uidR.active) {
        this.index = this.users.findIndex(user => user.uid === uidR.params.uid);
        debug('userschanged, find index for ' + uidR.params.uid + ' as ' + this.index);
        if (this.index < 0) switchPath('/summary');
      }
    }
    super.update(changed);
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
          managed-page
          .users=${this.users} 
          .name=${this.name} 
          @user-selected=${this._selectUser}></fm-summary-display>`,
        user: html`<fm-user-scores 
          managed-page
          .user=${this.index >= 0? this.users[this.index] : {uid:0,name:'',rounds:[]}}
          .name=${this.name}></fm-user-scores>` 
      }[this.page])}
    `;
  }
  loadPage(page) {
    if (page === 'home') {
      import('./fm-summary-display.js');
    } else {
      import('./fm-user-scores.js');
    }

  }
  async _newRoute() {
    this.fetchdataInProgress = true;
    debug('about to fetch users_summary');
    const response = await api('user/users_summary');
    debug('got users_summary');
    this.fetchdataInProgress = false;
    this.users = response.users;
    this.name = response.name;
  }
  _selectUser(e) {
    e.stopPropagation();
    
    switchPath(`/summary/user/${e.uid}`)
  }
}
customElements.define('fm-summary', FmSummary);