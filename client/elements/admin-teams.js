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
import './admin-conf-div.js';
import './fm-checkbox.js';
import './material-icon.js';
import page from '../styles/page.js';

import {TeamLock, TeamsReset} from '../modules/events.js';


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
      points: {type: Number}, //default playoff points
      lock: {type: Boolean} //Changing selection is Locked
    };
  }
  constructor() {
    super();
    this.teams = [];
    this.confs = [];
    this.divs = [];
    this.points = 0;
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
        #toprow {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
        #toprow > div {
          cursor: pointer;
        }
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
        <div id="toprow">
          ${cache(this.lock ? '' : html`<div @click=${this._reset}><material-icon>autorenew</material-icon>Reset Points</div>`)}
          <fm-checkbox ?value=${this.lock} @value-changed=${this._lockChanged}>Teams In Competition Locked</fm-checkbox>
        </div>
        <section id="list" class="scrollable">
          ${cache(this.confs.map(conf => this.divs.map(div => 
            html`<admin-conf-div 
              data-conf=${conf.confid} 
              data-div=${div.divid} 
              class="item" 
              .teams=${this.teams}
              .conf=${conf} 
              .div=${div} 
              .points=${this.points}
              ?lock=${this.lock}></admin-conf-div>`)))}
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
  _reset(e) {
    e.stopPropagation()
    this.dispatchEvent(new TeamsReset());
  }

}
customElements.define('admin-teams', AdminTeams);