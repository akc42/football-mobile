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
import { MenuReset, MenuAdd, PageClose } from '../modules/events.js';
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
      round: {type: Object}, //hosts the full data for the round (including match results)
      iCanPick: {type:Boolean} //set to true of data received shows currentUser can still pick;
    };
  }
  constructor() {
    super();
    this.users = [];
    this.round = {rid: 0, name: '',matches:[], options:[]};
    this.roundRoute = {active: false};
    this.rid = 0;
    this.rRouter = new Route('/:rid', 'page:rounds');
    this.uRouter = new Route('/:uid', 'page:user');
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
    if (changed.has('route') && this.route.active) {
        this.dispatchEvent(new MenuReset());
        this.dispatchEvent(new MenuAdd('scores'));
        this._newRoute();
    }
    if (changed.has('subRoute') && this.subRoute.active) {
      const uidR = this.uRouter.routeChange(this.subRoute);
      if (uidR.active) {
        this.dispatchEvent(new MenuAdd('close'));
         if (!this.fetchdataInProgress) {
          this._setupUser(uidR.params.uid);
         } else {
           debug('fetch in progress, delayed index setting');
         }
      }
    }
    if(changed.has('users') && this.subRoute.active) {
      debug('users changed (as a result of fetching?')
      const uidR = this.uRouter.routeChange(this.subRoute);
      if (uidR.active) this._setupUser(uidR.params.uid);
    }
    super.update(changed);
  }

  updated(changed) {
    if (changed.has('roundRoute') && this.roundRoute.active) {
      this.route = this.rRouter.routeChange(this.roundRoute);
      if (this.route.active) {
        if (this.route.params.rid === '') {
          if (global.cid === global.lcid) {
            //for this cid, we know the latest round
            this.rRouter.params = { rid: global.lrid }
          } else {
            //don't know it, so need to go fetch
            api(`users/${global.cid}/latest_round`).then(response => this.route.params = response);
          }
        }
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
          ?iCanPick=${this.iCanPick}
          .users=${this.users} 
          .round=${this.round}
          @user-selected=${this._selectUser}></rounds-home>`,
        user: html`<rounds-user 
          managed-page
          ?isOpen=${this.iCanPick}
          .user=${this.user}
          .round=${this.round}
          @option-pick=${this._optionPick}
          @@match-pick=${this._matchPick}></rounds-user>` 
      }[this.page])}
    `;
  }
  loadPage(page) {
    import(`./rounds-${page}.js`);
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
        if (global.cid === global.lcid) match.deadline = match.match_time - global.lgap;
        const {aid, ...teamData} = response.teams.find(t => t.aid === match.aid);
        if (aid === undefined) {
          Object.assign(match, {aname:'',alogo:'',hname:'',hlogo:''});
        } else {
          Object.assign(match,{...teamData});
        }
      }
      this.round.options = response.cache.options;
      const cutoff = Math.floor(new Date().getTime() / 1000);
      this.round.optionOpen = (cutoff < this.round.deadLine); //convenient helper;
      this.users = response.cache.users;
      this.users.sort((a,b) => b.score - a.score);  //order users by desc score.
      //we need to find out for each user if they have made all their picks or not

      this.iCanPick = false;
      for (const user of this.users) {
        user.validQuestion = this.round.valid_question; //helps for <fm-round-user> to know what to display
        user.ouRound = this.round.ou_round === 1; //helps for <fm-round-user> to know what to display
        user.doneAllPicks = true;
        user.hadAdminSupport = false;
        user.wasLatePick = false
        user.wasLateBonus = (this.round.valid_question === 1  && user.submit_time !== null && user.submit_time > this.round.deadline);
        user.canPick = false;
        user.canBonus = false;
        user.picks = response.cache.picks.filter(p => p.uid === user.uid);
        for (const pick of user.picks) {
          if (global.cid === global.lcid || pick.submit_time !== null) {
            const match = this.round.matches.find(m => m.aid === pick.aid);
            if (global.cid === global.lcid && match.deadline > cutoff) user.canPick = true; //can still make  pick so mark as such
            if (pick.submit_time !== null && match.match_time - global.lgap < pick.submit_time) user.wasLatePick = true;
          }
          if (pick.submit_time === null) {
            user.doneAllPicks = false;
          }
          if (pick.admin_made === 1) user.hadAdminSupport = true;
          
        }
        if (this.round.valid_question === 1 && 
          global.cid === global.lcid && 
          this.round.deadline > cutoff && user.submit_time === null ) user.canOption = true; //still time to make a pick
        if ((user.canOption || user.canPick) && user.cid === global.uid) this.iCanPick = true;

      }
    }
  }
  _selectUser(e) {
    e.stopPropagation();
    this.router
    switchPath(`/rounds/${this.round.rid}/user/${e.uid}`);
  }
  _setupUser(uid) {
    this.user = this.users.find(user => user.uid === uid);
    debug('set up user ' + uid);
    if (this.user === undefined) {
      this.user = { uid: 0, name: '' };
      this.dispatchEvent(new PageClose());
      debug('did not find user')
    } else {
      //we merge user picks into the match as its much easier to deal with in elements below this one
      for (const match of this.round.matches) {
        match.ouRound = this.user.ouRound;
        const pick = this.user.picks.find(p => p.aid === match.aid);
        if (pick !== undefined) {
          const {aid, comment, ...pickSubset} = pick;
          Object.assign(match, pickSubset, {userComment: comment});
        } else {
          //we need to clear out anything related to picks left over from maybe another selected user.
          delete match.pid;
          delete match.over_selected;
        }
      }
    }

  }
}
customElements.define('rounds-manager', RoundsManager);