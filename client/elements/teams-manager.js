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
import { cache } from '../libs/cache.js';

import api from '../modules/api.js';
import Route from '../modules/route.js';

import RouteManager from './route-manager.js';

import {MenuReset, MenuAdd, PageClosed, WaitRequest, PlayoffFail} from '../modules/events.js';
import global from '../modules/globals.js';
import Debug from '../modules/debug.js';
import { switchPath } from '../modules/utils.js';
const debug = Debug('teams');

/*
     <team-manager>
*/
class TeamsManager extends RouteManager {
  static get styles() {
    return css`
        :host {
          height: 100%;
        }
    `;
  }
  static get properties() {
    return {
      teamRoute: {type:Object}, //this is my incoming route, so I can collect the params before passing to page manager
      teams: {type: Array},  
      confs: {type: Array},
      divs: {type: Array},
      deadline: {type: Number}, //deadline for the picks
      users: {type: Array}, //Matches team array, but each entry will be an array of users who picked the team for playoff
      user: {type: Object}, //specific user in uid = me.

    };
  }
  constructor() {
    super();
    this.teams = [];
    this.confs = [];
    this.divs = [];
    this.users = [];
    this.deadline = 0;
    this.showAllUsers = false;
    this.user = global.user;
    this.lastCid = 0;
  }
  connectedCallback() {
    super.connectedCallback();
    this.user = global.user;
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

  render() {
    return html`
      <style>
      </style>
        ${cache({
          home: html`<teams-home 
            managed-page 
            .users=${this.users} 
            .teams=${this.teams} 
            .confs=${this.confs} 
            .divs=${this.divs}
            .deadline=${this.deadline}></teams-home>`,
          user: html`<teams-user 
            managed-page
            .user=${this.user}
            .teams=${this.teams} 
            .confs=${this.confs} 
            .divs=${this.divs} 
            .deadline=${this.deadline}
            @playoff-pick=${this._picksChanged}></teams-user>`
        }[this.page])}
    `;
  }
  loadPage(page) {
    if (page === this.homePage()) {
      this.dispatchEvent(new MenuReset())
    } else {
      this.dispatchEvent(new MenuAdd());
    }
    this.dispatchEvent(new WaitRequest(true));
    import(`./teams-${page}.js`).then(() => this.dispatchEvent(new WaitRequest(false)));

  }
  async _newRoute() {
    if (this.lastCid !== global.cid) { //don't repeat ourselves if still in the team section when we get a new route.
      this.lastCid = global.cid; 
      this.dispatchEvent(new WaitRequest(true));
      const response = await api(`user/${global.cid}/playoff_picks`);
      this.dispatchEvent(new WaitRequest(false));
      debug('we have the fetched picks');
      this.teams = response.teams;
      this.confs = response.confs;
      this.divs = response.divs;
      this.users = response.users;
      for( const user of this.users) {
        user.picks = response.picks.filter(pick => pick.uid === user.uid);
        if (user.uid === global.user.uid) this.user = user;  //we now have a record of me AND my picks
      }
      this.deadline = response.deadline;
    }
  }
  async _picksChanged(e) {
    e.stopPropagation();
    const cutoff = Math.floor(new Date().getTime() / 1000);
    if (this.deadline < cutoff) {
      switchPath(`/${global.cid}/teams`); //can't continue past deadline, just go to display picks
    } else {
      const sender = e.composedPath()[0];
      const pick = e.pick;//remember it until we get a response from the api call..
          this.dispatchEvent(new WaitRequest(true));
      const response = await api(`user/${global.cid}/update_ppick`, pick);
      this.dispatchEvent(new WaitRequest(false));
      if (response.status) {
        this.user.picks = response.picks;
        const user = { ...this.user }; //clone it ;
        for (let i = 0; i < this.users.length; i++) {
          if (this.users[i].uid === global.user.uid) {
            this.users[i] = user
            break;
          }  
        }
        this.user = user; //trigger user update
        this.users = this.users.slice(0); //trigger updates all round
        
      } else {
        sender.dispatchEvent(new PlayoffFail(pick))
      }
    }
  }
}
customElements.define('teams-manager', TeamsManager);