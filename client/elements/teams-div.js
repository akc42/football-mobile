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
import { LitElement, html, css } from '../libs/lit-element.js';
import {cache} from '../libs/cache.js';

import './football-page.js';
import page from '../styles/page.js';

import './conf-div.js';
import { switchPath } from '../modules/utils.js';
import global from '../modules/globals.js';


/*
     <teams-div>: Lists All the Players Picks for A Conference Division
*/
class TeamsDiv extends LitElement {
  static get styles() {
    return [page, css``];
  }
  static get properties() {
    return {
      conf: {type: Object},
      div: {type: Object}, 
      teams: {type: Array},
      users: {type: Array},
      deadline: {type: Number}
    };
  }
  constructor() {
    super();
    this.conf = {confid: '', name: ''};
    this.div = {divid: '', name: ''};
    this.teams = [];
    this.users = [];
    this.deadline = 0;
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
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
        #list {
          height: 100%;
        }

        #list > .item {
          scroll-snap-align:start;
          border-radius: 5px;
          box-shadow: 1px 1px 3px 0px var(--shadow-color);
          margin:0 5px 5px 3px;
        }

      </style>
      <football-page id="page" heading="Divisional Playoff Picks">
        <div slot="heading">${this.conf.name} - ${this.div.name}</div>
        <section id="list" class="scrollable">
          ${cache(this.users.map(user => html`
            <conf-div 
              class="item" 
              data-uid=${user.uid}
              .teams=${this.teams} 
              .conf=${this.conf} 
              .div=${this.div}
              .deadline=${this.deadline}
              .user=${user} 
              @click=${this._selectUser}></conf-div>
          `))}
        </section>
      </football-page>
    `;
  }
  _selectUser(e) {
    e.stopPropagation();
    switchPath(`/${global.cid}/teams/user/${e.target.dataset.uid}`);
  }
}
customElements.define('teams-div', TeamsDiv);