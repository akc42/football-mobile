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

import './user-pick.js';
import './material-icon.js';
import './fm-input.js';

import {PlayoffPick} from '../modules/events.js';

/*
     <pick-conf-div>
*/
class PickConfDiv extends LitElement {
  static get styles() {
    return [];
  }
  static get properties() {
    return {
      teams: {type: Array}, //Array of all teams in competition
      teamsindiv: {type: Array}, //filted list for this div
      conf: {type: Object},
      div: {type: Object},
      user: {type: Object}, //user, including their picks.
      deadline: {type: Number} //deadline for picks
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
    this._handleFail = this._handleFail.bind(this);

  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('playoff-fail', this._handleFail);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('playoff-fail', this._handleFail);
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
    if(changed.has('deadline')) {
      
    }
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
          margin: 2px;
          padding: 2px;
          border-radius:5px;
          box-shadow: 2px 2px 5px 4px var(--shadow-color);
          display:grid;
          grid-gap: 2px;
          grid-template-columns: 50px 25px;
          grid-template-rows: 1fr 1fr;
          grid-template-areas:
            "team points"
            "team pick";
          cursor: pointer;
        }

        .title, .points, .pick {
          background-color: var(--background-color);
          text-align: center;

        }

        .title {
          grid-area: team;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
          text-align: center;
        }
        .points {
          grid-area: points;
        }
        .pick {
          grid-area: pick;
        }
        .pick.fail {
          background-color: var(--fm-pick-fail);
        }


      </style>
      <header>
        <div>${this.conf.name} - ${this.div.name}</div>
      </header>
      <div class="divteam">
      ${this.teamsindiv.map(team => {
        const pick = this.user.picks.find(p => p.tid === team.tid);
        return html`
          <div 
            class="team" 
            @click=${this._makePick}
            data-tid=${team.tid}>
            <div class="title">
              <img src="/appimages/teams/${team.tid}.png" alt="${team.name}"/>
              <div class="name">${team.tid}</div>
            </div>  
            <div class="points">${team.points}</div>
            <div class="pick">${cache(pick !== undefined ? html`<user-pick  
                ?correct=${team.made_playoff === 1} 
                ?admin=${pick.admin_made === 1}
                .deadline=${this.deadline}
                .made=${pick.submit_time}></user-pick>` : '')}</div>
    
          </div>
      `;
      })}
      </div>

    `;
  }
  _handleFail(e) {
    const element = this.shadowRoot.querySelector(`.team[data-tid="${e.pick.tid}"] > .pick`); //locate the spot that had the pick
    element.classList.add('fail');
    const timer = setInterval(() => {
      element.classList.toggle('fail');
    },200)
    setTimeout(() => {
      clearInterval(timer);
      element.classList.remove('fail');
    }, 2000); //flash for two seconds

  }
  _makePick(e) {
    e.stopPropagation();
    const tid = e.currentTarget.dataset.tid
    const pick = this.user.picks.find(p => p.tid === tid);
    this.dispatchEvent(new PlayoffPick({uid: this.user.uid, tid:tid, pick: pick === undefined})); 
  }
}
customElements.define('pick-conf-div', PickConfDiv);