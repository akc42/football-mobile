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
import './pick-conf-div.js';
import { PageClosed } from '../modules/events.js';


/*
     <teams-user>: Specific Users Playoff Picks
*/
class TeamsUser extends LitElement {
  static get styles() {
    return [page, css``];
  }
  static get properties() {
    return {
      teams: {type: Array},
      confs: {type: Array},
      divs: {type: Array},
      user: {type: Object},
      deadline: {type: Number}
    };
  }
  constructor() {
    super();
    this.teams = [];
    this.confs = [];
    this.divs = [];
    this.user = {uid: 0, name: '', picks: []};
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
    if (changed.has('deadline')) {
      const cutoff = Math.floor(new Date().getTime() / 1000);
      if (this.deadline < cutoff) this.dispatchEvent(new PageClosed());
    }
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
      <football-page id="page" heading="Make Playoff Picks" nohead>
        <div slot="heading">${this.user.name}</div>
        <section id="list" class="scrollable">
          ${cache(this.confs.map(conf => this.divs.map(div => html`
            <pick-conf-div 
              class="item" 
              .teams=${this.teams} 
              .conf=${conf} 
              .div=${div}
              .user=${this.user}
              .deadline=${this.deadline}></pick-conf-div>
          `)))}
        </section>
      </football-page>
    `;
  }
}
customElements.define('teams-user', TeamsUser);