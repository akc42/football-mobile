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

import {MenuReset, MenuAdd, PageClosed, WaitRequest} from '../modules/events.js';
import global from '../modules/globals.js';
import Debug from '../modules/debug.js';
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
      user: {type: Object}, //specific user in uid
      div: {type: Object},
      conf: {type: Object},
    };
  }
  constructor() {
    super();
    this.teamRoute = {active: false, params: {}}
    this.uid = 0;
    this.teams = [];
    this.confs = [];
    this.divs = [];
    this.users = [];
    this.div = {divid: '', name: 'dummy'};
    this.conf = {confid: '', name: 'dummy'};
    this.deadline = 0;
    this.dRouter = new Route('/:confid/:divid','page:div');
    this.uRouter = new Route(':uid','page:user');
    this.showAllUsers = false;
    this.user={uid:0, picks:[], name: 'dummy'};
    this.fetchdataInProgress = false;
    this.lastCid = 0;
  }
  connectedCallback() {
    super.connectedCallback();
    this.fetchdataInProgress = false;
    this.lastCid = 0;
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
        this.dispatchEvent(new MenuAdd());  
        debug('user route is active');
        if (this.fetchdataInProgress) {
          debug('fetch still in progress so delay setting up user')
          this.user = {uid: uidR.params.uid, name: 'dummy', picks: []};
        } else {
          this.user = this.users.find(user => user.uid === uidR.params.uid);
          if (this.user === undefined) {
            debug('could not find user user ' + uidR.params.uid);
            this.dispatchEvent(new PageClosed());
          }
        }
      } else {
        this.user = {uid : 0, picks:[], name: 'dummy'};
      }
      const divR = this.dRouter.routeChange(this.subRoute);
      if (divR.active) {
        this.dispatchEvent(new MenuAdd());
        debug('div route is active')
        if (this.fetchdataInProgress) {
          debug('fetch still in progress, so delay setting up conf and div');
          this.conf = {confid: divR.params.confid, name: 'dummy'};
          this.div = {divid: divR.params.divid, name:'dummy'};
        } else {
          this.conf = this.confs.find(conf => conf.confid === divR.params.confid);
          this.div = this.divs.find(div => div.divid === divR.params.divid)
          if (!(this.conf !== undefined && this.div !== undefined)) {
            debug('could not find conf and div');
            this.dispatchEvent(new PageClosed());
          }
        }
      } else {
        //we are not using those at the moment, so we can mark them as such
        this.conf = {confid: '',name:'dummy'};
        this.div = {divid : '', name: 'dummy'};
      }
    }
    super.update(changed);
  }

  render() {
    return html`
      <style>
      </style>
        ${cache({
          home: html`<teams-home managed-page .teams=${this.teams} .confs=${this.confs} .divs=${this.divs}></teams-home>`,
          div: html`<teams-div 
            managed-page 
            .teams=${this.teams} 
            .conf=${this.conf} 
            .div=${this.div} 
            .users=${this.users}
            .deadline=${this.deadline}></teams-div>`,
          user: html`<teams-user 
            managed-page
            .teams=${this.teams} 
            .confs=${this.confs} 
            .divs=${this.divs} 
            .user=${this.user} 
            .deadline=${this.deadline}
            @picks-changed=${this._picksChanged}></teams-user>`
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
      this.fetchdataInProgress = true;
      debug('about to fetch picks');
      const response = await api(`user/${global.cid}/playoff_picks`);
      debug('we have the fetched picks');
      this.fetchdataInProgress = false;
      this.teams = response.teams;
      this.confs = response.confs;
      this.divs = response.divs;
      this.users = response.users;
      for( const user of this.users) {
        user.picks = response.picks.filter(pick => pick.uid === user.uid);
      }
      this.deadline = response.deadline;

      let failedConfDiv = false;
      if (this.conf.confid.length > 0) { //looking for a conf
        debug('delayed look for conf');
        this.conf = this.confs.find(conf => conf.confid === this.conf.confid);
        if (this.conf === undefined) failedConfDiv = true; 
      }
      if (this.div.divid.length > 0) { //looking for a div
        debug('delayed look for div');
        this.div = this.divs.find(div => div.divid === this.div.divid);
        if (this.div === undefined) failedConfDiv = true;
      }
      if (failedConfDiv) {
        debug('failed in delayed look for conf and div');
        this.dispatchEvent(new PageClosed());
      } else if ( this.user.uid !== 0) {
        debug('delayed look for user');
        this.user = this.users.find(user => user.uid === this.user.uid);
        if (this.user === undefined)  {
          debug('failed in delayed look for user');
          this.dispatchEvent(new PageClosed());
        }
      } 
    }
  }
  _picksChanged(e) {
    e.stopPropagation();
    //TODO update local copy of picks and also the database
  }
}
customElements.define('teams-manager', TeamsManager);