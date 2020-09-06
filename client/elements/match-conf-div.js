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
import { LitElement, html } from '../libs/lit-element.js';


import {TeamSelected} from '../modules/events.js';


/*
     <match-conf-div>: simple list of teams in this conf div, used in match selection
*/
class MatchConfDiv extends LitElement {
  static get styles() {
    return [];
  }
  static get properties() {
    return {
      teams: {type: Array}, //Array of teams in competition not in a match
      conf: {type: Object},
      div: {type: Object},
      divteams: {type: Array} //Our filtered copy of teams array
    };
  }
  constructor() {
    super();
    this.teams = [];
    this.divteams = [];
    this.conf = {name:'', confid:''};
    this.div = {name:'', divid: ''};
    this._deselected = this._deselected.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('team-deselected', this._deselected);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('team-deselected', this._deselected);
  }
  update(changed) {
    if (changed.has('teams') || changed.has('conf') || changed.has('div')) {
      this.divteams = this.teams.filter(team => team.confid === this.conf.confid && team.divid === this.div.divid);
    }
    super.update(changed);
  }
  firstUpdated() {
  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    const cutoff = Math.floor(new Date().getTime()/1000);
    return html`
      <style>
        header {
          display: flex;
          flex-direction: row;
          width:100%;
          border:1px solid var(--accent-color);
          box-sizing:border-box;
          margin-bottom: 5px;
          border-radius:5px;
          padding: 3px;
          justify-content: space-around;
        }
        .divteam {
          display: flex;
          flex-direction:row;
          flex-wrap:wrap;
          justify-content: space-between;
        }
        .team {
          border: 2px solid var(--accent-color);
          margin: 5px;
          padding: 2px;
          border-radius:5px;
          box-shadow: 2px 2px 5px 4px var(--shadow-color);
          display:flex;
          flex-direction: column;
          cursor:pointer;
        }
        .name {
          font-weight: bold;
          font-size: 10px;
        }

      </style>
      <header>
        <div>${this.conf.name} - ${this.div.name}</div>
      </header>
      <div class="divteam">
        ${this.divteams.map(team => html`
          <div class="team" data-tid=${team.tid} @click=${this._selected}>
            <img src="/appimages/teams/${team.tid}.png"/>
            <div class="name">${team.tid}</div>
          </div>
        `)}
      </div>
    `;
  }
  _deselected(e) {
    e.stopPropagation();
    //we are sent this because team is added to this.teams, but the whole array was not updated.
    this.divteams = this.teams.filter(team => team.confid === this.conf.confid && team.divid === this.div.divid);
  }
  _selected(e) {
    e.stopPropagation();
    const tid = e.currentTarget.dataset.tid;
    this.divteams = this.divteams.filter(t => t.tid !== tid); //this triggers our update to the rest of the environment doesn't have to
    this.dispatchEvent(new TeamSelected(tid));
  }
}
customElements.define('match-conf-div', MatchConfDiv);