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

import Debug from '../modules/debug.js';
const debug = new Debug('admin-round');


/*
     <admin-round>: Actually a high level manager for rounds
*/
class AdminRounds extends RouteManager {
  static get styles() {
    return  css`
      :host {
        height: 100%;
      }
    `;
  }
  static get properties() {
    return {
      rounds: {type: Array},
      teams: {type: Array},
      confs: {type: Array},
      divs: {type: Array}
    };
  }
  constructor() {
    super();
    this.rounds = [];
    this.teams = [];
    this.confs = [];
    this.divs = [];

  }
  render() {
    return html`
      ${cache({
        home: html`<admin-round-home managed-page .rounds=${this.rounds}></admin-round-home>`,
        round: html`<admin-round-round 
          managed-page 
          .ridRoute=${this.subRoute} 
          .rounds=${this.rounds} 
          .teams=${this.teams}
          .confs=${this.confs}
          .divs=${this.divs}></admin-round-round>`
      }[this.page])}
    `;
  }
  loadPage(page) {
    debug(`loading ${page}`);
    this.dispatchEvent(new WaitRequest(true));
    import(`./admin-round-${page}.js`).then(() => this.dispatchEvent(new WaitRequest(false)));
  }
}
customElements.define('admin-rounds', AdminRounds);