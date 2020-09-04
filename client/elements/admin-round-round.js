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

import global from '../modules/globals.js';
import api from '../modules/api.js';

import{WaitRequest} from '../modules/events.js';

import RouteManager from './route-manager.js';
import Router from '../modules/route.js';

import Debug from '../modules/debug.js'
const debug = new Debug('admin-round-round');

/*
     <admin-round-round>: Competition Admin Round Management 2nd Level
*/
class AdminRoundRound extends RouteManager {
  static get styles() {
    return  css`
      :host {
        height: 100%;
      }
    `;
  }
  static get properties() {
    return {
      ridRoute: {type: Object} ,
      rid: {type: Number},
      rounds: {type: Array},
      teams: {type: Array},
      round: {type: Object},
      options: {type: Array},
      matches: {type: Array},
      confs: {type: Array},
      divs: {type: Array}
    };
  }
  constructor() {
    super();
    this.ridRoute = {active: false};
    this.rid = 0;
    this.rrouter = new Router(':rid', 'page:round');
    this.rounds = [];
    this.teams = [];
    this.matches = [];
    this.options = [];
    this.confs = [];
    this.divs = [];
    this.round = {rid: 0}
    this.lastRid = 0;
  }
  connectedCallback() {
    super.connectedCallback();
    this.lastRid = 0;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    if (changed.has('ridRoute')) {
      this.route = this.rrouter.routeChange(this.ridRoute);
      if (this.route.active) {
        this.rid = this.route.params.rid;
      }
    }
    super.update(changed);
  }
  firstUpdated() {
  }
  updated(changed) {
    if (changed.has('rid') || changed.has('rounds')) {
      const round = this.rounds.find(r => r.rid === this.rid);
      if (round !== undefined) {
        this.round = round;
        this._newRound();
      } else {
        throw new Error('invalid round id' + this.rid);
      }
    }
    super.updated(changed);
  }
  render() {
    return html`
      <style>
      </style>
      ${cache({
        home: html`<admin-round-round-home 
          managed-page
          .round=${this.round}
          .options=${this.options}
          @option-create=${this._optionCreate}
          @option-delete=${this._optionDelete}></admin-round-round-home>`,
        match: html`<admin-round-round-match
          managed-page
          .round=${this.round}
          .teams=${this.teams}
          .confs=${this.confs}
          .divs=${this.divs}
          .matches=${this.matches}
         @match-create=${this._matchCreate}
         @match-delete=${this._matchDelete}
         @match-update=${this._matchUpdate}></admin-round-round-match>`
      }[this.page])}
    `;
  }
  loadPage(page) {
    debug(`loading ${page}`);
    this.dispatchEvent(new WaitRequest(true));
    import(`./admin-round-round-${page}.js`).then(() => this.dispatchEvent(new WaitRequest(false)));
  }

  _matchCreate(e) {
    e.stopPropagation();
  }
  _matchDelete(e) {
    e.stopPropagation();
  }
  _matchUpdate(e) {
    e.stopPropagation();
  } 

  async _newRound() {
    if (this.lastRid !== this.rid) {
      this.lastRid = this.rid;
      this.dispatchEvent(new WaitRequest(true));
      const response = await api(`admin/${global.cid}/fetch_matches_options`,{rid: this.rid});
      this.dispatchEvent(new WaitRequest(false));
      this.matches = response.matches;
      this.options = response.options
    }
  }
  async _optionCreate(e) {
    e.stopPropagation();
    const params = {...e.option, rid: this.round.rid}
    this.dispatchEvent(new WaitRequest(true));
    const response = await api(`admin/${global.cid}/create_option`,params);
    this.dispatchEvent(new WaitRequest(false));
    this.options = response.options;
  }
  async _optionDelete(e) {
    e.stopPropagation();
    const params = { ...e.option, rid: this.round.rid }
    this.dispatchEvent(new WaitRequest(true));
    const response = await api(`admin/${global.cid}/delete_option`, params);
    this.dispatchEvent(new WaitRequest(false));
    this.options = response.options;
  }

}
customElements.define('admin-round-round', AdminRoundRound);