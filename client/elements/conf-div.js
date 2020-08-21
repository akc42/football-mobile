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
import {PlayoffPick} from '../modules/events.js';
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
      deadline: {type: Number} //deadline for picks
    };
  }
  constructor() {
    super();
    this.teams = [];
    this.conf = {name:'', confid:''};
    this.div = {name:'', divid: ''};
    this.user = {uid: 0, picks: []};
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
    const cutoff = Math.floor(new Date().getTime()/1000);
    return html`
      <style>
        header {
          text-align: center;
          width:100%;
          border:1px solid var(--accent-color);
          box-sizing:border-box;
          margin-bottom: 5px;
          border-radius:5px;
        }
        header.notme {
          border:1px solid var(--secondary-color);
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
      ${cache(this.user.uid === 0 ?
        html`<header>${this.conf.name} - ${this.div.name}</header>` : 
        html`<header class=${classMap({notme: global.user.uid !== this.user.uid})}>User: ${this.user.name} Picks</header>`
      )}
      <div class="divteam">
      ${this.teams.filter(team => team.confid === this.conf.confid && team.divid === this.div.divid).map(team => {
        let pick ;
        if (this.user.uid !== 0) pick = this.user.picks.find(p => p.tid === team.tid);
        return html`
          <div 
            class="team ${classMap({pickable:this.user.uid === global.uid && this.deadline > cutoff})}" 
            @click=${this._makePick}
            data-tid=${team.tid}>
            <img src="/appimages/teams/${team.tid}.png"/>
            <div class="name">${team.name}</div>
            <div class="poff">${cache(team.made_playoff === 1 ? html`<material-icon>emoji_events</material-icon>` : '')}</div>
            <div class="points">${team.points}</div>
            <div class="pick">${cache(pick !== undefined ? html`<user-pick 
              result 
              ?correct=${team.made_playoff === 1} 
              ?admin=${pick.admin_made === 1}
              .deadline=${this.deadline}
              .made=${pick.submit_time}></user-pick>` : '')}</div>
            <div class="name">${team.name}</div>
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
      this.dispatchEvent(new PlayoffPick(e.target.dataset.tid)); 
    }
  }
}
customElements.define('conf-div', ConfDiv);