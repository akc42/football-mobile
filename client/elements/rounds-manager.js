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
      admin: {type: Boolean}, //if set this is admin able to make picks on behalf og users
      user: {type: Object}, //to hold selected user (including their picks)
      round: {type: Object},
      options: {type: Array},
      matches: {type: Array},
      next: {type: Number},
      previous: {type: Number}
    };
  }
  constructor() {
    super();
    this.users = [];
    this.round = {rid: 0};
    this.options = [];
    this.matches = [];
    this.next = 0;
    this.previous = 0;
    this.rid = 0;
    this.rRouter = new Route('/:rid', 'page:rounds');
    this.roundRoute = {active: false};
    this.lastCid = 0;
    this.lastRid = 0;
    this.user = {uid:0, name : '', picks: []};
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
    if (changed.has('route') && this.route.active) {
      if (typeof this.route.params.rid === 'number') {
        this._newRoute();
      }
    }
    super.update(changed);
  }

  updated(changed) {
    if (changed.has('roundRoute') && this.roundRoute.active) {
      const route = this.rRouter.routeChange(this.roundRoute);
      if (typeof route.params.rid !== 'number') {
        this._getRid();
      } else {
        this.route = route;
      }
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
          ?admin=${this.admin}
          .round=${this.round}
          .next=${this.next}
          .previous=${this.previous}
          .options=${this.options}
          .matches=${this.matches}
          @rid-change=${this._gotoRound}></rounds-home>`,
        user: html`<rounds-user
          managed-page
          .user=${this.user}
          .round=${this.round}
          .options=${this.options}
          .matches=${this.matches}
          @match-pick=${this._matchPick}
          @option-pick=${this._optionPick}></rounds-user>`
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
  async _getRid() {
    this.dispatchEvent(new WaitRequest(true));
    const response = await api(`user/${global.cid}/find_latest_rid`,);
    this.dispatchEvent(new WaitRequest(false));
    this.rRouter.params = {rid: response.rid};
  }
  _gotoRound(e) {
    e.stopPropagation();
    this.rRouter.params = {rid:e.rid};
  }
  async _newRoute() {
    if (this.lastRid !== this.route.params.rid || this.lastcid !== global.cid) {
      this.lastRid = this.route.params.rid;
      this.lastCid = global.cid;

      this.dispatchEvent(new WaitRequest(true));
      const response = await api(`user/${global.cid}/round_data`,{rid: this.route.params.rid});
      this.dispatchEvent(new WaitRequest(false));
      if (this.roundRoute.query.admin !== undefined &&
        (global.user.uid === global.luid || global.user.global_admin == 1)) {
        this.next = 0;
        this.previous == 0;
        this.admin = true;
      } else {
        this.admin = false;
        this.next = response.next;
        this.previous = response.previous;
      }
      this.round = response.round;
      this.matches = response.cache.matches;
      this.round.match_deadline = 0; //very latest match deadline we can use to control if link to make picks
      for (const match of this.matches) {
        this.round.match_deadline = Math.max(match.deadline, this.round.match_deadline);
        const {aid, ...teamData} = response.teams.find(t => t.aid === match.aid);
        if (aid === undefined) {
          Object.assign(match, {aname:'',hname:''});
        } else {
          Object.assign(match,{...teamData});
        }
      }
      this.options = response.cache.options;
      this.users = response.cache.users;
      this.users.sort((a,b) => b.score - a.score);  //order users by desc score.
      for (const user of this.users) {
        this._processUserPicks(user, response.cache.picks.filter(p => p.uid === user.uid) );
        if (user.uid === global.user.uid) this.user = user;
      }
    }
  }

  async _matchPick(e) {
    e.stopPropagation();
    const pick = e.pick;
    this.dispatchEvent(new WaitRequest(true));
    const response = await api(`user/${global.cid}/update_pick`,pick);
    this.dispatchEvent(new WaitRequest(false));
    this.users = this.users.slice(0); //refresh 
    const user = this.user.find(u => u.uid === pick.uid);
    this._processUserPicks(user, response.picks)
  }
  async _optionPick(e) {
    e.stopPropagation();


  }
  _processUserPicks(user, picks) {
    user.validQuestion = this.round.valid_question; //helps for <fm-round-user> to know what to display
    user.ouRound = this.round.ou_round === 1; //helps for <fm-round-user> to know what to display
    user.hadAdminSupport = false;
    user.wasLatePick = false
    user.wasLateBonus = (this.round.valid_question === 1 && user.submit_time !== null && user.submit_time > this.round.deadline);
    user.picks = picks;
    for (const pick of user.picks) {
      if (pick.submit_time !== null) {
        const match = this.matches.find(m => m.aid === pick.aid);
        if (match !== undefined && match.deadline < pick.submit_time) user.wasLatePick = true;
      }
      if (pick.admin_made === 1) user.hadAdminSupport = true;
    }
  }
}
customElements.define('rounds-manager', RoundsManager);
