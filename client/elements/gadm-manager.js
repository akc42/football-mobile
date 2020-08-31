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
import {  html, css } from '../libs/lit-element.js';
import {cache} from '../libs/cache.js';
import {MenuAdd, MenuReset,WaitRequest, CompetitionsReread} from '../modules/events.js';
import RouteManager from './route-manager.js';
import api from '../modules/api.js';
import global from '../modules/globals.js';


/*
     <gadm-manager>: Main Page for all the global admin functions
*/
class GadmManager extends RouteManager {
  static get styles() {
    return css`
        :host {
          height: 100%;
        }
    `;
  }
  static get properties() {
    return {
      competitions: {type: Array},
      users: {type: Array}
    };
  }
  constructor() {
    super();
    this.readData = false;
    this.competitions = [];
    this.users = [];
  }
  connectedCallback() {
    super.connectedCallback();
    this.readData = false;
    this.fetchDataInProgress = false;
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
      <style >
      </style >
      ${cache({
          home: html`<gadm-home 
            managed-page 
            .users=${this.users} 
            .competitions=${this.competitions} 
            @competition-changed=${this._competitionChanged}
            @competition-create=${this._newCompetition}
            @competition-delete=${this._deleteCompetition}></gadm-home>`,
          promote: html`<gadm-promote managed-page .users=${this.users}></gadm-promote>`,
          email: html`<gadm-email managed-page .users=${this.users} .route=${this.subroute}></gadm-email>`
      }[this.page])}
    `;
  }
  loadPage(page) {
    this.dispatchEvent(new WaitRequest(true));
    import(`./gadm-${page}.js`).then(() => this.dispatchEvent(new WaitRequest(false)));
    if (page === this.homePage()) {
      this.dispatchEvent(new MenuReset())
    } else {
      this.dispatchEvent(new MenuAdd());
    }
  }
  async _competitionChanged(e) {
    e.stopPropagation(e);
    const params = e.changed;
    const response = await api('gadm/update_competition',params);
    const index = this.competitions.findIndex(c => c.cid === response.competition.cid);
    if (index >= 0 ) {
      this.competitions.splice(index,1,response.competition);
      this.competitions = this.competitions.slice(0);
      this.dispatchEvent(new CompetitionsReread());
    }
  } 
  async _deleteCompetition(e) {
    e.stopPropagation();
    const cid = parseInt(e.cid,10);
    const response = await api('gadm/delete_competition', {cid: cid});
    if (response.status) {
      //it worked, so now we have to remove
      const index = this.competitions.findIndex(c => c.cid === cid);
      if (index >=0) {
        this.competitions.splice(index);
        this.competitions = this.competitions.slice(0);  //update competitions so it causes and update.
      }
      if (global.cid === cid) global.cid = 0;  //if we deleted the competition we are connected to 
      this.dispatchEvent(new CompetitionsReread());
    }
  } 
  async _newCompetition(e) {
    e.stopPropagation();
    const competition = e.competition;
    const response = await api('gadm/new_competition', competition);
    competition.cid = response.cid;
    this.competitions.push(competition);
    this.competitions = this.competitions.slice(0);
    if (global.cid === global.lcid) global.cid = 0; //we were looking at latest competition, so now we had better reset to the new latest
    this.dispatchEvent(new CompetitionsReread());


  }
  async _newRoute() {
    if (!this.readData) {
      this.readData = true;
      this.fetchDataInProgress = true
      const response = await api('gadm/fetch_global_data');
      this.fetchDataInProgress = false;
      this.competitions = response.competitions;
      this.users = response.users;
      for (const user of this.users) {
        user.selected = false; //just add this extra field as a useful addition
      }
    }

  }
}
customElements.define('gadm-manager', GadmManager);