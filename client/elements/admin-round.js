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
import {html, css } from '../libs/lit-element.js';
import {cache} from '../libs/cache.js';

import {WaitRequest} from '../modules/events.js';

import RouteManager from './route-manager.js';


/*
     <admin-round>: Actually a high level manager for rounds
*/
class AdminRound extends RouteManager {
  static get styles() {
    return  css`
      :host {
        height: 100%;
      }
    `;
  }
  static get properties() {
    return {
      ridPage: {type: String}, //substitute for page which holds the rid.
      rounds: {type: Array},
      teams: {type: Array},
      round: {type: Object}
    };
  }
  constructor() {
    super();
    this.ridPage = 'home';
    this.rounds = [];
    this.teams = [];
    this.round = {rid: 0, name:''}
  }
  connectedCallback() {
    super.connectedCallback();
    this.ridPage = 'home';
  }

  render() {
    return html`
      ${cache({
        home: html`<admin-round-home managed-page .rounds=${this.rounds}></admin-round-home>`,
        round: html`<admin-round-round managed-page .route=${this.subroute} .round=${this.round} .teams=${this.teams}></admin-round-round>`
      }[this.ridPage])}
    `;
  }
  loadPage(page) {
    let ip = './admin-round-round.js';
    this.ridPage = 'round';
    if (page === 'home') {
      ip = './admin-round-home.js';
      this.ridPage = 'home';
    }
    this.dispatchEvent(new WaitRequest(true));
    import(ip).then(() => this.dispatchEvent(new WaitRequest(false)));
  }
}
customElements.define('admin-round', AdminRound);