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
import global from '../modules/globals.js';
import { switchPath } from '../modules/utils.js';
import Debug from '../modules/debug.js';
const debug = new Debug('rounds');

/*
     <fm-rounds>
*/
class FmRounds extends PageManager {
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
    this.index = -1;
    this.round = {rid: 0, name: '',matches:[], options:[]};
    this.roundRoute = {active: false};
    this.rid = 0;
    this.rRouter = new Route('/:rid', 'page:rounds');
    this.uRouter = new Route('/user/:uid');
    this.fetchdataInProgress = false;
    this.lastCid = 0;
    this.lastRid = 0;
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
        this._newRoute();
    }
    if (changed.has('subRoute') && this.subRoute.active) {
      const uidR = this.uRouter.routeChange(this.subRoute);
      if (uidR.active) {
        this.dispatchEvent(new MenuAdd('close'));
         if (!this.fetchdataInProgress) {
            this.index = this.users.findIndex(user => user.uid === uidR.params.uid);
            debug('no fetch happening, find index for ' + uidR.params.uid + ' as ' + this.index);
            if (this.index < 0) switchPath('/rounds');
         } else {
           debug('fetch in progress, delayed index setting');
         }
      } else {
        switchPath('/rounds');
      }
    }
    if(changed.has('users') && this.subRoute.active) {
      debug('users changed (as a result of fetching?')
      const uidR = this.uRouter.routeChange(this.subRoute);
      if (uidR.active) {
        this.index = this.users.findIndex(user => user.uid === uidR.params.uid);
        debug('userschanged, find index for ' + uidR.params.uid + ' as ' + this.index);
        if (this.index < 0) switchPath('/scores');
      }
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
            this.route.params = { rid: global.lrid }
          } else {
            //don't know it, so need to go fetch
            api('users/latest_round').then(response => this.route.params = response);
          }
        }
      }
    }
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
        home: html`<fm-rounds-home 
          managed-page
          ?iCanPick=${this.iCanPick}
          .users=${this.users} 
          .round=${this.round}
          @user-selected=${this._selectUser}></fm-rounds-home>`,
        user: html`<fm-rounds-user 
          managed-page
          ?iCanPick=${this.iCanPick}
          .user=${this.index >= 0? this.users[this.index] : {uid:0,name:'',picks:{}}}
          .round=${this.round}
          @picks-made=${this._picksMade}></fm-rounds-user>` 
      }[this.page])}
    `;
  }
  loadPage(page) {
    if (page === 'home') {
      import('./fm-rounds-home.js');
    } else {
      import('./fm-rounds-user.js');
    }

  }
  async _newRoute() {
    if (typeof this.route.params.rid === 'number' && (this.lastRid !== this.route.params.rid || this.lastcid !== global.cid)) {
      this.lastRid = this.route.params.rid;
      this.lastCid = global.cid;
      this.fetchdataInProgress = true;
      debug('about to fetch round_data');
      const response = await api('user/round_data',{rid: this.route.params.rid});
      debug('got rounddata');
      this.fetchdataInProgress = false;
      this.round = response.round;
      this.round.matches = response.cache.matches;
      for (const match of this.round.matches) {
        const {aid, ...teamData} = response.teams.find(t => t.aid === match.aid);
        if (aid === undefined) {
          Object.assign(match, {aname:'',alogo:'',hname:'',hlogo:''});
        } else {
          Object.assign(match,{...teamData});
        }
      }
      this.users = response.cache.users;
      this.users.sort((a,b) => b.score - a.score);  //order users by desc score.
      //we need to find out for each user if they have made all their picks or not
      const cutoff = Math.floor(new Date().getTime()/1000);
      this.iCanPick = false;
      for (const user of this.users) {
        user.doneAllPicks = true;
        user.canPick = false;
        user.canOption = false;
        user.picks = response.cache.picks.filter(p => p.uid === user.uid);
        for (const pick of user.picks) {
          if (pick.submit_time === null) {
            user.doneAllPicks = false;
          }
          if (global.cid === global.lcid) {
            //only worry about this if its the current competition
            const match = this.round.matches.find(m => m.aid === pick.aid);
            if (match.deadline - global.gap> cutoff) user.canPick = true; //can still make  pick so mark as such
          }
          
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
    switchPath()
    //switchPath(`/scores/user/${e.uid}`)
  }
}
customElements.define('fm-rounds', FmRounds);