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

import RouteManager from './route-manager.js';
import { MenuReset, MenuAdd } from '../modules/events.js';
import Route from '../modules/route.js';
import api from '../modules/api.js';
import global from '../modules/globals.js';
import { switchPath } from '../modules/utils.js';
import Debug from '../modules/debug.js';
const debug = new Debug('scores');

/*
     <scores-manager>
*/
class ScoresManager extends RouteManager {
  static get properties() {
    return {
      users: {type: Array}, //to hold full competitions cache result
      user: {type:Object},  //a selected on of the users above
      rounds: {type: Array}, //array of rounds and their names, augmented by user round scores when user is selected
      userRoute : {type: Object},

    };
  }
  constructor() {
    super();
    this.users = [];
    this.user = {uid:0, name:'', rscore:0, pscore: 0, rounds:[]};
    this.rounds = [];
    this.uRouter = new Route('/:uid','page:user');
    this.userRoute = {active: false}
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
        this._newRoute();
    }
    if (changed.has('subRoute') && this.subRoute.active) {
      this.userRoute = this.uRouter.routeChange(this.subRoute);
      if (this.userRoute.active) {
         if (!this.fetchdataInProgress) {
            this.user = this.users.find(user => user.uid === this.userRoute.params.uid);
            debug('no fetch happening, find index for ' + this.userRoute.params.uid);
            if (this.user === undefined)  {
              this.user = { uid: 0, name: '', rscore: 0, pscore: 0, rounds: [] }; //reset user to dummy
              switchPath('/scores');
            } else {
              for (const round of this.rounds) {
                const scores = this.user.rounds.find(r => r.rid === round.rid);
                if (scores === undefined) {
                  Object.assign(round,{score:0, bscore:0, mscore:0, pscore: 0, oscore: 0});
                } else {
                  Object.assign(round, { ...scores});
                }
              }
            }


         } else {
           debug('fetch in progress, delayed index setting');
         }
      } else {
        switchPath('/scores');
      }
    }
    if(changed.has('users') && this.userRoute.active) {
      this.user = this.users.find(user => user.uid === this.userRoute.params.uid);
      debug('no fetch happening, find  ' + this.userRoute.params.uid);
      if (this.user === undefined) {
        this.user = { uid: 0, name: '', rscore: 0, pscore: 0, rounds: [] }; //reset user to dummy
        switchPath('/scores');
      } else {
        for (const round of this.rounds) {
          const scores = this.user.rounds.find(r => r.rid === round.rid);
          if (scores === undefined) {
            Object.assign(round,{ score: 0, bscore: 0, mscore: 0, pscore: 0, oscore: 0 });
          } else {
            Object.assign(round, { ...scores });
          }
        }
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
        home: html`<scores-home 
          managed-page
          .users=${this.users} 
          @user-selected=${this._selectUser}></scores-home>`,
        user: html`<scores-user 
          managed-page
          .user=${this.user}
          .rounds=${this.rounds}
          .name=${this.name}
          @round-selected=${this._selectRound}></scores-user>` 
      }[this.page])}
    `;
  }
  loadPage(page) {
    import (`./scores-${page}.js`);
    if (page === this.homePage()) {
      this.dispatchEvent(new MenuReset())
    } else {
      this.dispatchEvent(new MenuAdd());
    }
  }
  async _newRoute() {
    if (this.lastCid !== global.cid) {  //don't repeat if we don't have to
      this.lastCid = global.cid;
      this.fetchdataInProgress = true;
      debug('about to fetch users_summary');
      const response = await api(`user/${global.cid}/competition_scores`);
      debug('got users_summary');
      this.fetchdataInProgress = false;
      this.users = response.cache.users;
      this.users.sort((a,b) => b.tscore - a.tscore); //sort in decending order of total score.
      for(const user of this.users) {
        user.rounds = response.cache.rounds.filter(u => u.uid === user.uid); //put all the round data with correct user (sort comes later)
      }
      this.rounds = response.rounds.reverse();
    }
  }
  _selectUser(e) {
    e.stopPropagation();
    switchPath(`/scores/user/${e.uid}`);
  }
  _selectRound(e) {
    switchPath(`/rounds/${e.rid}/user/${this.user.uid}`);
  }
}
customElements.define('scores-manager', ScoresManager);