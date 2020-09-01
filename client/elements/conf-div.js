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

import {PlayoffPick, TeamAssign, TeamPoint} from '../modules/events.js';
import global from '../modules/globals.js';

/*
     <conf-div>
*/
class ConfDiv extends LitElement {
  static get styles() {
    return [];
  }
  static get properties() {
    return {
      teams: {type: Array}, //Array of all teams in competition
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
        .me {
          border-radius: 2px;
          border:1px solid var(--accent-color);
          padding: 2px;
          margin-right: 5px;
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
          margin: 5px;
          padding: 2px;
          border-radius:5px;
          box-shadow: 2px 2px 5px 4px var(--shadow-color);
          display:grid;
          grid-gap: 2px;
          grid-template-columns: 50px 25px 25px;
          grid-template-rows: 24px 24px 30px;
          grid-template-areas:
            "logo madepo points"
            "logo pick pick"
            "name name name";
        }
        .team.tic {
          --input-width: 35px;
          grid-template-areas:
            "logo cbx cbx"
            "logo inp inp"
            "name name name"
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
        .poff, .team img, .points, .pick, .name {
          background-color: var(--background-color);
          text-align: center;

        }


        .poff {
          color:var(--fm-in-playoff);
          grid-area: madepo;
        }
        .team img {
          grid-area: logo;
        }
        .points {
          grid-area: points;
        }
        .pick {
          grid-area: pick;
        }
        .name {
          grid-area:name;
          font-weight: bold;
          font-size: 10px;
        }
        .pickable {
          cursor: pointer;
        }

      </style>
      <header>
        ${cache(this.user.uid !== 0 && !this.nome ? 
          html`<div class="${classMap({ me: this.user.uid === global.user.uid})}">User: ${this.user.name}'s Picks</div>`
        : '')}
        <div>${this.conf.name} - ${this.div.name}</div>
      </header>
      <div class="divteam">
      ${this.teams.filter(team => team.confid === this.conf.confid && team.divid === this.div.divid).map(team => {
        let pick ;
        if (this.user.uid !== 0) pick = this.user.picks.find(p => p.tid === team.tid);
        return html`
          <div 
            class="team ${classMap({
              pickable:this.user.uid === global.user.uid && this.deadline > cutoff,
              tic: this.tic})}" 
            @click=${this._makePick}
            data-tid=${team.tid}>
            <img src="/appimages/teams/${team.tid}.png"/>
            <div class="name">${team.name}</div>
            ${cache(this.tic ? html`
              <div class="cbx">
                <fm-checkbox .value=${team.points !==null } @value-changed=${this._ticChanged} data-tid=${team.tid} ?disabled=${this.lock}></fm-checkbox>
              </div>
              <div class="inp">
                <fm-input 
                  message=""
                  preventInvalid
                  type="number" 
                  .value=${team.points === null ? '': team.points.toString()} 
                  ?required=${team.points !== null} 
                  ?disabled=${team.points === null}
                  min="1" 
                  max="8" 
                  step="1"
                  data-tid=${team.tid}
                  @blur=${this._updatePoints}></fm-input>
              </div>
            ` :html`
              <div class="poff">${cache(team.made_playoff === 1 ? html`<material-icon>emoji_events</material-icon>` : '')}</div>
              <div class="points">${team.points}</div>
              <div class="pick">${cache(pick !== undefined ? html`<user-pick 
                result 
                ?correct=${team.made_playoff === 1} 
                ?admin=${pick.admin_made === 1}
                .deadline=${this.deadline}
                .made=${pick.submit_time}></user-pick>` : '')}</div>
            `)}
          </div>
      `;
      })}
      </div>

    `;
  }
  _makePick(e) {
    const cutoff = Math.floor(new Date().getTime() / 1000);
    if(this.user.uid === global.uid && this.deadline > cutoff) {
      e.stopPropagation();
      this.dispatchEvent(new PlayoffPick(e.currentTarget.dataset.tid)); 
    }
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
customElements.define('conf-div', ConfDiv);