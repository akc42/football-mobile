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
import { classMap } from '../libs/class-map.js';
import './user-pick.js';
import './material-icon.js';
import './fm-input.js';


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
      users: {type: Array}, 
      teamsindiv: {type: Array}
    };
  }
  constructor() {
    super();
    this.teams = [];
    this.conf = {name:'', confid:''};
    this.div = {name:'', divid: ''};
    this.users = [];
    this.teamsindiv = [];
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    if (changed.has('teams') || changed.has('conf') || changed.has('div') ) {
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
          grid-template-columns:1.5fr 1fr;
          grid-template-rows: repeat(1fr);
          grid-template-areas:
            "title madepo"
            "title points";
        }

        .poff, .title, .points {
          background-color: var(--background-color);
          text-align: center;

        }
        .title {
          grid-area: title;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          text-align: center;
        }

        .poff {
          color:var(--fm-in-playoff);
          grid-area: madepo;
        }

        .points {
          grid-area: points;
        }

        .user, .divteam {
          width:100%;
          border:1px solid var(--accent-color);
          box-sizing:border-box;
          margin-bottom: 5px;
          border-radius:5px;
          grid-gap: 1px;
          display: grid;
          flex-direction: row;
          grid-template-columns: 1.5fr repeat(4, 1fr);
          grid-template-areas: 
            "name . . . ."
            "label label label cscore tscore"
        }
        .user:not(.me) {
          border:1px solid var(--secondary-color);
        }
        .user {
          background-color: var(--secondary-color);
        }
        .name, user-pick, .spacer, .label, .cscore, .tscore{
          background-color: var(--background-color);
        }
        .name {
          padding:2px;
          grid-area: name;
        }
        .label {
          grid-area: label;
        }
        .cscore {
          grid-area: cscore;
        }
        .tscore {
          grid-area: tscore;
        }
      </style>
      <header>
        <div>${this.conf.name} - ${this.div.name}</div>
      </header>
      
      <div class="divteam">
        <div></div>
        ${cache(this.teamsindiv.map(team => html`
          <div class="team">
            <div class="title">
              <img src="/appimages/teams/${team.tid}.png" alt="${team.name}"/>
              <div>${team.tid}</div>
            </div>  
            <div class="poff">${cache(team.made_playoff === 1 ? html`<material-icon>emoji_events</material-icon>` : '')}</div>
            <div class="points">${team.points}</div>
          </div>
        `))}
      </div>
      <div class="users">
        ${cache(this.users.map(user => html`
          <div class="user ${classMap({me: user.uid === global.user.uid})}">
            <div class="name">${user.name}</div>
            ${cache(this.teamsindiv.map(team => {
              const pick = user.picks.find(pick => pick.tid === team.tid);
              return pick !== undefined ? html`<user-pick 
                ?admin=${pick.admin_made === 1}
                ?correct=${team.made_playoff === 1}
                .made=${pick.submit_time}
                .deadline=${this.deadline}
                ?result=${team.update_date > this.deadline}></user-pick>`:html`<div class="spacer"></div>`;
            }))}
            ${cache(this.div.divid === 'N' ? html`
              <div class="label">${this.conf.confid} and Total Playoff Score</div>
              <div class="cscore">${this.conf.confid === 'AFC' ? user.ascore : user.nscore}</div>
              <div class="tscore">${user.pscore}</div>
            `:'')}
          </div>
        `))}
      </div>

    `;
  }
}
customElements.define('conf-div', ConfDiv);