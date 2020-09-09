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
import {cache} from '../libs/cache.js';
import {classMap} from '../libs/class-map.js';

import './user-pick.js';
import './material-icon.js';
import './fm-input.js';

import {TeamAssign, TeamPoint, TeamEliminated} from '../modules/events.js';
import global from '../modules/globals.js';

/*
     <admin-conf-div>
*/
class AdminConfDiv extends LitElement {
  static get styles() {
    return [];
  }
  static get properties() {
    return {
      teams: {type: Array}, //Array of all teams in competition
      teamsindiv: {type: Array}, //filted teams to just this division
      conf: {type: Object},
      div: {type: Object},
      user: {type: Object}, //If set this may include users picks (and will pass back clicks to pick a team)
      deadline: {type: Number}, //deadline for picks
      nome: {type: Boolean}, //If set don't highlight conf-div heading for user = me.
      tic: {type: Boolean}, //set if this usage is in team in competition - so its about if team is selected
      lock: {type: Boolean}, //set if we can no longer edit tic
      points: {type:Number} //default points to allocate to a new tic.
    };
  }
  constructor() {
    super();
    this.teams = [];
    this.teamsindiv = [];
    this.conf = {name:'', confid:''};
    this.div = {name:'', divid: ''};
    this.user = {uid: 0, picks: []};
    this.deadline = 0;
    this.nome = false;
    this.tic = false;
    this.lock = false;
    this.points = 0;
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    if (changed.has('teams') || changed.has('conf') || changed.has('div')) {
      this.teamsindiv = this.teams.filter(team => team.confid === this.conf.confid && team.divid === this.div.divid);
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
          background-color: var(--accent-color); 
          border: 1px solid var(--accent-color);
          --icon-size:20px;
          --input-width: 35px;
          margin: 5px;
          padding: 2px;
          border-radius:5px;
          box-shadow: 2px 2px 5px 4px var(--shadow-color);
          display:grid;
          grid-gap: 2px;
          grid-template-columns: 50px 25px 25px;
          grid-template-rows: 24px 24px 30px;          
          grid-template-areas:
            "logo cbx cbx"
            "logo inp inp"
            "name name elim"
        }
        .cbx {
          grid-area: cbx;
          background-color: var(--background-color);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .inp {
          grid-area: inp;
          background-color: var(--background-color);
          display: flex;
          justify-content: center;
          align-items: center;

        }
        .team img {
          grid-area: logo;
        }

        .name {
          grid-area:name;
          font-weight: bold;
          font-size: 10px;
          background-color: var(--background-color);
        }

        .elim {
          grid-area: elim;
          background-color: var(--background-color);
        }
        .in {
          color: var(--item-present);
        }
        .out {
          color: var(--item-not-present);
        }

      </style>
      <header>

        <div>${this.conf.name} - ${this.div.name}</div>
      </header>
      <div class="divteam">
        ${this.teamsindiv.map(team => html`
          <div class="team tic">
            <img src="/appimages/teams/${team.tid}.png"/>
            <div class="name">${team.name}</div>

            <div class="cbx">
              <fm-checkbox .value=${team.points !==null } @value-changed=${this._ticChanged} data-tid=${team.tid} ?disabled=${this.lock}>In</fm-checkbox>
            </div>
            <div class="inp">
              <fm-input 
                message=""
                preventInvalid
                type="number" 
                .value=${team.points === null ? '': team.points.toString()} 
                ?required=${team.points !== null} 
                min="1" 
                max="8" 
                step="1"
                data-tid=${team.tid}
                @blur=${this._updatePoints}></fm-input>
            </div>
            <div class="elim" @click=${this._toggleEliminated} data-tid=${team.tid} >
              ${team.eliminated === 0 ?html`<material-icon class="in">title</material-icon>`:html`<material-icon class="out">format_clear</material-icon>`}
            </div> 
          </div>
        `)}
      </div>

    `;
  }
  _ticChanged(e) {
    e.stopPropagation();
    const tid = e.currentTarget.dataset.tid; 
    const team = this.teams.find(t => t.tid === tid);
    if (team !== undefined) {
      team.points = e.changed ? this.points:null;
      this.requestUpdate();
    }
    this.dispatchEvent(new TeamAssign({ tid: tid, assign: e.changed }));
  }
  _toggleEliminated(e) {
    e.stopPropagation();
    const tid = e.currentTarget.dataset.tid;
    const team = this.teams.find(t => t.tid === tid);
    if (team !== undefined) {
      team.eliminated = team.eliminated === 0 ? 1 : 0;
      this.dispatchEvent(new TeamEliminated({tid: team.tid, eliminated: team.eliminated}));
    }
  }
  _updatePoints(e) {
    e.stopPropagation();
    const tid = e.currentTarget.dataset.tid; 
    const team = this.teams.find(t => t.tid === tid);
    if (team !== undefined) {
      const points = parseInt(e.currentTarget.value,10)
      if (points !== team.points) {
        //has changes so 
        team.points = points
        this.requestUpdate();
        this.dispatchEvent(new TeamPoint({tid: team.tid, points: points}))
      }
    }



  }
}
customElements.define('admin-conf-div', AdminConfDiv);