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
import './user-pick.js';
import './material-icon.js';

/*
     <fm-confdiv>
*/
class FmConfDiv extends LitElement {
  static get styles() {
    return [];
  }
  static get properties() {
    return {
      teams: {type: Array}, //Array of all teams in competition
      conf: {type: Object},
      div: {type: Object},
      user: {type: Boolean}, //If set this may include users picks (and will pass back clicks to pick a team)
      picks: {type: Array} ,
      deadline: {type: Number} //deadline for picks
    };
  }
  constructor() {
    super();
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
          border:1px solid var(--app-accent-color);
          box-sizing:border-box;
          margin-bottom: 5px;
        }
        .divteam {
          display: flex;
          flex-direction:row;
          flex-wrap:wrap;
          justify-content: space-between;
        }
        .team {
          --icon-size:20px;
          border: none;
          margin: 5px;
          padding: 2px;
          border-radius:5px;
          box-shadow: 2px 2px 5px 4px rgba(0,0,0,0.2);
          display:grid;
          grid-gap: 2px;
          grid-template-columns: 50px 25px 25px;
          grid-template-areas:
            "logo madepo points"
            "logo pick pick"
            "name name name";
          justify-items: center;
          align-items: center;
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

      </style>
      <header>${conf.name} - ${div.name}</header>
      <div class="divteam">
      ${this.teams.filter(team => team.confid === conf.confid && team.divid === div.divid).map(team => {
        let pick ;
        if (this.user) pick = this.userPicks.find(p => p.tid === team.tid);
        return html`
          <div 
            class="team ${classMap({pickable:this.user && this.deadline > cutoff})}" 
            @click=${this._makePick}
            data-tid=${team.tid}>
            <img src="/appimage/teams/${team.tid}.png"/>
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

  }
}
customElements.define('fm-confdiv', FmConfDiv);