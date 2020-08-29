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
import { html, css } from '../libs/lit-element.js';
import {cache} from '../libs/cache.js';

import RouteManager from './route-manager.js';
import { MenuReset, MenuAdd } from '../modules/events.js';
import api from '../modules/api.js';
import global from '../modules/globals.js';
import { switchPath } from '../modules/utils.js';
import Debug from '../modules/debug.js';
const debug = new Debug('admin');
import './calendar-dialog.js';


/*
     <admin-manager>: Competition Admin Main Page
*/
class AdminManager extends RouteManager {
  static get styles() {
    return css`        
      :host {
        height: 100%;
      }
    `;
  }
  static get properties() {
    return {
      competition: {type: Object},
      rounds: {type: Array},
      teams: {type: Array},
      users: {type: Array},
      hasTic: {type: Boolean}
    };
  }
  constructor() {
    super();
    this.competition = {cid:0, name:'', expected_date: 0}
  }
  connectedCallback() {
    super.connectedCallback();
    this.lastCid = 0;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    if (changed.has('route') && this.route.active) {
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
      </style>
      <calendar-dialog></calendar-dialog>
      ${cache({
        home: html`<admin-home 
          .competition=${this.competition} 
          managed-page
          @competition-changed=${this._competitionChanged}></admin-home>`,
        teams: html`<admin-teams managed-page ?hasTic=${this.hasTic} .teams=${this.teams} @team-assigned=${this._teamAssign}></admin-teams>`,
        map: html`<admin-map managed-page></admin-map>`,
        round: html`<admin-round managed-page .route=${this.subroute}></admin-round>`,
        email: html`<admin-email managed-page></admin-email>`,
        help: html`<admin-help managed-page></admin-help>`
      }[this.page])}
    `;
  }
  loadPage(page) {
    import(`./admin-${page}.js`);
    if (page === this.homePage()) {
      this.dispatchEvent(new MenuReset())
    } else {
      this.dispatchEvent(new MenuAdd());
    }
  }
  async _competitionChanged(e) {
    e.stopPropagation();
    if (e.changed.cid === this.competition.cid) {
      this.competition = {...this.competition, ...e.changed};
      const response = await api(`admin/${global.cid}/competition_update`, e.changed);
      if (response.competition !== undefined) this.competition = response.competition;
    }
  }
  async _newRoute() {
    if (this.lastCid !== global.cid) {  //don't repeat if we don't have to
      this.lastCid = global.cid;
      this.fetchdataInProgress = true;
      debug('about to fetch compeition data');
      const response = await api(`admin/${global.cid}/competition_data`);
      debug('got competition_data');
      this.fetchdataInProgress = false;
      this.competition = response.competition;
      this.rounds = response.rounds;
      this.teams = response.teams;
      this.users = response.users; 
      this.hasTic = response.maxtc === global.cid;
      if (this.rounds.length > 0) {
        let rid = 0;
        for(const round of this.rounds) {
          if (round.rid > rid) rid = round.rid;
        }
        switchPath(`/${global.cid}/admin/round/${rid}`);
      }
    }
  }
}
customElements.define('admin-manager', AdminManager);