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
import './conf-div.js';
import page from '../styles/page.js';
import { switchPath } from '../modules/utils.js';
import global from '../modules/globals.js';

/*
     <teams-home>: description
*/
class TeamsHome extends LitElement {
  static get styles() {
    return [page, css``];
  }
  static get properties() {
    return {
      teams: {type: Array},
      confs: {type: Array},
      divs: {type: Array}
    };
  }
  constructor() {
    super();
    this.teams = [];
    this.confs = [];
    this.divs = [];
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
      <football-page id="page" heading="Teams">
        <section id="list" class="scrollable">
          ${cache(this.confs.map(conf => this.divs.map(div => html`<conf-div data-conf=${conf.confid} data-div=${div.divid} @click=${this._selectDiv} class="item" .teams=${this.teams} .conf=${conf} .div=${div}></conf-div>`)))}
        </section>
      </football-page>
    `;
  }
  _selectDiv(e) {
    switchPath(`/${global.cid}/teams/div/${e.target.dataset.conf}/${e.target.dataset.div}`);
  }
}
customElements.define('teams-home', TeamsHome);