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
import { MenuAdd, MenuReset, WaitRequest, CompetitionsReread } from '../modules/events.js';
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
      tics: {type: Array}, //subset of teams that are in this competition;
      users: {type: Array},
      confs: { type: Array },
      divs: { type: Array },
      maxtic: {type: Number}, //largest cid in team_in_competition
      rid: {type: Number} //largest round.

    };
  }
  constructor() {
    super();
    this.competition = {cid:0, name:'', expected_date: 0}
    this.rounds = [];
    this.teams = [];
    this.users = [];
    this.confs = [];
    this.divs = [];
    this.maxtic = 0;
    this.rid = 0;
    this.tics = [];
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
          .maxtic=${this.maxtic} 
          .rid=${this.rid}
          @teams-set=${this._teamsSet}
          @competition-changed=${this._competitionChanged}></admin-home>`,
        teams: html`<admin-teams 
          managed-page
          .confs=${this.confs}
          .divs=${this.divs}
          .teams=${this.teams}
          .points=${this.competition.default_playoff}
          ?lock=${this.competition.team_lock === 1}
          @teams-reset=${this._teamsReset}
          @team-assign=${this._teamAssign}
          @team-lock=${this._teamLocked}
          @team-point=${this._teamPoint}></admin-teams>`,
        rounds: html`<admin-rounds 
          managed-page
          .confs=${this.confs}
          .divs=${this.divs}
          .rounds=${this.rounds} 
          .teams=${this.tics} 
          .route=${this.subRoute}
          @round-create=${this._roundCreate}
          @round-delete=${this._roundDelete}></admin-rounds>`,
        email: html`<admin-email .users=${this.users} managed-page></admin-email>`,
        help: html`<admin-help managed-page></admin-help>`
      }[this.page])}
    `;
  }
  loadPage(page) {
    debug(`loading ${page}`);
    this.dispatchEvent(new WaitRequest(true));
    import(`./admin-${page}.js`).then(() => this.dispatchEvent(new WaitRequest(false)));
    if (page === this.homePage()) {
      this.dispatchEvent(new MenuReset());
    } else {
      this.dispatchEvent(new MenuAdd());
    }
  }
  async _competitionChanged(e) {
    e.stopPropagation();
    if (e.changed.cid === this.competition.cid) {
      const nameChanged = e.changed.name !== undefined;
      this.competition = {...this.competition, ...e.changed};
      this.dispatchEvent(new WaitRequest(true));
      const response = await api(`admin/${global.cid}/competition_update`, e.changed);
      this.dispatchEvent(new WaitRequest(false));
      if (response.competition !== undefined) this.competition = response.competition;
      if (nameChanged) this.dispatchEvent(new CompetitionsReread());
    }
  }
  async _newRoute() {
    if (this.lastCid !== global.cid) {  //don't repeat if we don't have to
      this.lastCid = global.cid;
      this.dispatchEvent(new WaitRequest(true));
      this.fetchdataInProgress = true;
      debug('about to fetch compeition data', global.cid);
      const response = await api(`admin/${global.cid}/competition_data`);
      debug('got competition_data');
      this.fetchdataInProgress = false;
      this.dispatchEvent(new WaitRequest(false));
      this.competition = response.competition;
      this.rounds = response.rounds;
      this.maxtic = response.maxtic;
      if (this.maxtic >= this.competition.cid) {
        this.teams = response.teams;
        this.tics = this.teams.filter(t => t.points !== null);
      }
      this.users = response.users; 
      this.confs = response.confs;
      this.divs = response.divs;
      if (this.rounds.length > 0) {
        this.rid = this.rounds.reduce((ac, cur) => {
          return Math.max(ac, cur.rid);
        }, 0);
        switchPath(`/${global.cid}/admin/rounds/round/${this.rid}`);
      } else {
        this.rid = 0;
      }

    }
  }
  async _roundCreate(e) {
    e.stopPropagation();
    debug('Round Create Started')
    this.dispatchEvent(new WaitRequest(true));
    const response = await api(`admin/${global.cid}/round_create`, e.round);
    this.dispatchEvent(new WaitRequest(false));
    this.rounds = response.rounds;
    this.rid = response.rid;
    debug('Round Created with rid of',this.rid);
  }
  async _roundDelete(e) {
    e.stopPropagation();
    debug('Round Delete')
    this.dispatchEvent(new WaitRequest(true));
    const response = await api(`admin/${global.cid}/round_delete`, { rid: e.round });
    this.dispatchEvent(new WaitRequest(false));
    this.rounds = response.rounds;
    this.rid = 0;
    if (this.rounds.length > 0) {
      for (const round of this.rounds) {
        if (round.rid > this.rid) this.rid = round.rid;
      }
    }
  }
  async _teamAssign(e) {
    e.stopPropagation();
    this.dispatchEvent(new WaitRequest(true));
    const response = await api(`admin/${global.cid}/team_assign`, e.assign);
    this.dispatchEvent(new WaitRequest(false));
    this.teams = response.teams
    this.tics = this.teams.filter(t => t.points !== null);
  }
  _teamLocked(e) {
    e.stopPropagation();
    e.changed = {cid: this.competition.cid, team_lock: e.lock ? 1: 0}
    this._competitionChanged(e);
  }
  async _teamPoint(e) {
    e.stopPropagation();
    const points = e.point;
    this.dispatchEvent(new WaitRequest(true));
    const response = await api(`admin/${global.cid}/team_point`, points);
    this.dispatchEvent(new WaitRequest(false));
    this.teams = response.teams;  //we return all the teams just to ensure we are still synchronised
    this.tics = this.teams.filter(t => t.points !== null);
  }
  async _teamsReset(e) {
    e.stopPropagation();
    this.dispatchEvent(new WaitRequest(true));
    const response = await api(`admin/${global.cid}/teams_reset`);
    this.dispatchEvent(new WaitRequest(false));
    for (const team of this.teams) {
      if (team.points !== null) team.points = response.points;
    }
    this.teams = this.teams.slice(0); //make a copy to force an update
  }
  async _teamsSet(e) {
    e.stopPropagation();
    this.dispatchEvent(new WaitRequest(true));
    const response = await api(`admin/${global.cid}/make_tics`);
    this.dispatchEvent(new WaitRequest(false));
    this.teams = response.teams;
    this.tics = this.teams.filter(t => t.points !== null);

  }
}
customElements.define('admin-manager', AdminManager);