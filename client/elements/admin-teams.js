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
import './fm-checkbox.js';
import page from '../styles/page.js';
import {TeamLock} from '../modules/events.js';


/*
     <AdminTeams>: Allows the setting of Teams in Competition
*/
class AdminTeams extends LitElement {
  static get styles() {
    return [page, css``];
  }
  static get properties() {
    return {
      teams: {type: Array},
      confs: {type: Array},
      divs: {type: Array}, 
      lock: {type: Boolean} //Changing selection is Locked
    };
  }
  constructor() {
    super();
    this.teams = [];
    this.confs = [];
    this.divs = [];
    this.lock = false;
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
          cursor: pointer;
        }

      </style>
      <football-page id="page" heading="Teams">
        <fm-checkbox ?value=${this.lock} @value-changed=${this._lockChanged}>Teams In Competition Locked</fm-checkbox>
        <section id="list" class="scrollable">
          ${cache(this.confs.map(conf => this.divs.map(div => 
            html`<conf-div 
              data-conf=${conf.confid} 
              data-div=${div.divid} 
              class="item" 
              .teams=${this.teams}
              .conf=${conf} 
              .div=${div} 
              tic
              ?lock=${this.lock}></conf-div>`)))}
        </section>
      </football-page>
    `;
  }
  _lockChanged(e) {
    e.stopPropagation();
    this.lock=e.changed;
    this.dispatchEvent(new TeamLock(this.lock));
    this.requestUpdate();
  }

}
customElements.define('admin-teams', AdminTeams);