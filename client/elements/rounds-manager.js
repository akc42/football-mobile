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
import { html , css} from '../libs/lit-element.js';
import {cache} from '../libs/cache.js';

import RouteManager from './route-manager.js';
import { MenuReset, MenuAdd, PageClose, WaitRequest } from '../modules/events.js';
import Route from '../modules/route.js';
import api from '../modules/api.js';
import global from '../modules/globals.js';
import { switchPath } from '../modules/utils.js';
import Debug from '../modules/debug.js';
const debug = new Debug('rounds');

/*
     <rounds-manager>
*/
class RoundsManager extends RouteManager {
  static get styles () {
    return css`      
      :host {
        height: 100%;
      }
    `;
  }
  static get properties() {
    return {
      roundRoute: {type: Object}, //the route that got used here
      users: {type: Array}, //to hold full competitions cache result
      user: {type: Object}, //to hold selected user (including their picks)
      round: {type: Object}
    };
  }
  constructor() {
    super();
    this.users = [];
    this.round = {rid: 0, name: '',matches:[], options:[]};
    this.rid = 0;
    this.rRouter = new Route('/:rid', 'page:rounds');
    this.roundRoute = {active: false};
    this.fetchdataInProgress = false;
    this.lastCid = 0;
    this.lastRid = 0;
    this.user = {uid:0, name : ''};
  }
  connectedCallback() {
    super.connectedCallback();
    this.fetchdataInProgress = false;
    this.lastCid = 0;
    this.lastRid = 0;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    if (changed.has('route') && this.route.active) this._newRoute();
    super.update(changed);
  }

  updated(changed) {
    if (changed.has('roundRoute') && this.roundRoute.active) {
      this.route = this.rRouter.routeChange(this.roundRoute);
    }
    super.updated(changed);
  }
  render() {
    return html`
      <style>
  
      </style>
      ${cache({
        home: html`<rounds-home 
          managed-page
          .users=${this.users} 
          .round=${this.round}></rounds-home>`,
        bonus: html`<rounds-bonus 
          managed-page 
          .user=${this.user} 
          .round=${this.round} 
          @option-pick=${this._optionPick}></rounds-bonus>`,
        match: html`<rounds-match 
          managed-page 
          .user=${this.user} 
          .round=${this.round}
          @match-pick=${this._matchPick}k></rounds-match>`
      }[this.page])}
    `;
  }
  loadPage(page) {
    this.dispatchEvent(new WaitRequest(true));
    import(`./rounds-${page}.js`).then(() => this.dispatchEvent(new WaitRequest(false)));
    if (page === this.homePage()) {
      this.dispatchEvent(new MenuReset())
    } else {
      this.dispatchEvent(new MenuAdd());
    }
  }
  async _newRoute() {
    if (typeof this.route.params.rid === 'number' && (this.lastRid !== this.route.params.rid || this.lastcid !== global.cid)) {
      this.lastRid = this.route.params.rid;
      this.lastCid = global.cid;
      this.fetchdataInProgress = true;
      debug('about to fetch round_data');
      const response = await api(`user/${global.cid}/round_data`,{rid: this.route.params.rid});
      debug('got rounddata');
      this.fetchdataInProgress = false;
      this.round = response.round;
      this.round.matches = response.cache.matches;
      for (const match of this.round.matches) {
        match.deadline = match.match_time - (response.gap * 60);
        const {aid, ...teamData} = response.teams.find(t => t.aid === match.aid);
        if (aid === undefined) {
          Object.assign(match, {aname:'',alogo:'',hname:'',hlogo:''});
        } else {
          Object.assign(match,{...teamData});
        }
      }
      this.round.options = response.cache.options;
      this.round.optionOpen = (cutoff < this.round.deadLine); //convenient helper;
      this.users = response.cache.users;
      this.users.sort((a,b) => b.score - a.score);  //order users by desc score.
      for (const user of this.users) {
        user.validQuestion = this.round.valid_question; //helps for <fm-round-user> to know what to display
        user.ouRound = this.round.ou_round === 1; //helps for <fm-round-user> to know what to display
        user.hadAdminSupport = false;
        user.wasLatePick = false
        user.wasLateBonus = (this.round.valid_question === 1  && user.submit_time !== null && user.submit_time > this.round.deadline);
        user.picks = response.cache.picks.filter(p => p.uid === user.uid);
        for (const pick of user.picks) {
          if (pick.submit_time !== null) {
            const match = this.round.matches.find(m => m.aid === pick.aid);
            if (match !==undefined && match.deadline < pick.submit_time) user.wasLatePick = true;
          }
          if (pick.admin_made === 1) user.hadAdminSupport = true;
        }
        if (user.uid === global.user.uid) this.user = user;
       }
    }
  }
  async _matchPick(e) {
    e.stopPropagation();
    //todo add into existing data, but also update database.
    const pick = e.pick;
    const response = await api(`user/${global.cid}/update_pick`,pick);
  }
}
customElements.define('rounds-manager', RoundsManager);