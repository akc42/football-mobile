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
import { html } from '../libs/lit-element.js';

import api from '../modules/api.js';
import Route from '../modules/route.js';
import { cache } from '../libs/cache.js';
import './fm-page.js';

import './conf-div.js'
import RouteManager from './route-manager.js';
import page from '../styles/page.js';
import {MenuReset, MenuAdd} from '../modules/events.js';
import global from '../modules/globals.js';

/*
     <team-manager>
*/
class TeamsManager extends RouteManager {
  static get styles() {
    return [page];
  }
  static get properties() {
    return {
      uid: {type:Number},
      teamRoute: {type:Object}, //this is my incoming route, so I can collect the params before passing to page manager
      teams: {type: Array},  
      confs: {type: Array},
      divs: {type: Array},
      deadline: {type: Number}, //deadline for the picks
      picks: {type: Array}, //Matches team array, but each entry will be an array of users who picked the team for playoff
      userPicks: {type: Array}, //specific picks for user in uid
    };
  }
  constructor() {
    super();
    this.teamRoute = {active: false, params: {}}
    this.uid = 0;
    this.teams = [];
    this.confs = [];
    this.divs = [];
    this.picks = [];
    this.deadline = 0;
    this.dRouter = new Route('/:cofid/:divid','page:division');
    this.uRouter = new Route(':uid','page:user');
    this.showAllUsers = false;
    this.userPicks=[];
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    if (changed.has('route') && this.route.active) {
      this.dispatchEvent(new MenuReset());
      this.dispatchEvent(new MenuAdd('scores'));
      this._newRoute();
    } 
    if (changed.has('subRoute') && this.subRoute.active) {
      const uidR = this.uRouter.routeChange(this.subRoute);
        if (uidR.active) {
        this.dispatchEvent(new MenuAdd('close'));  
        //TODO Add code to select user 
       }
      }
    if (changed.has('uid') || changed.has('picks')) {
      this.userPicks = this.picks.filter(pick => pick.uid === this.uid);
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
      <fm-page heading="Teams">
        ${cache(this.userPicks.length > 0 ? html`
          <div slot="heading"><strong>${this.userPicks[0].name}</strong></div>
          <div slot="heading">${this.userPicks[0].score}</div>
        ` :'')}
        
        <section class="scrollable">
          ${cache({
            home: html`
              ${this.confs.map(conf => this.divs.map(div => html`
                <conf-div .teams=${this.teams} .conf=${conf} .div=${div} user .picks=${this.userPicks}></conf-div>
                </div>
              `))}`,
            users: html`<p>Still to Implement</p>`

          }[this.page])}
        </section>
      </fm-page>
    `;
  }
  async _newRoute() {
    const response = await api(`user/${global.cid}/playoff_picks`);
    this.teams = response.teams;
    this.confs = response.confs;
    this.divs = response.divs;
    this.picks = response.picks;
    this.deadline = response.deadline;

  }
}
customElements.define('teams-manager', TeamsManager);