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
import {classMap} from '../libs/class-map.js'; 


import { WaitRequest } from '../modules/events.js';
import api from '../modules/api.js';
import global from '../modules/globals.js';
import { switchPath } from '../modules/utils.js';

import './football-page.js';
import './round-header.js';
import page from '../styles/page.js'
/*
     <scores-manager>
*/
class ScoresManager extends LitElement {

  static get styles() {
    return [page,css`        
      header.total, section.usertotal {
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-areas:
          "user rs ps"
          "user ts ts";
      }
      header.total, header.round, section.usertotal.me, section.userround.me {
        border:2px solid var(--accent-color);
        background-color: var(--accent-color);
      }
      section.usertotal, section.userround {
        border:2px solid var(--secondary-color);
        background-color: var(--secondary-color);
      }
      header.total, header.round, section.usertotal, section.userround {
        border-radius: 5px;
        box-shadow: 1px 1px 3px 0px var(--shadow-color);
        margin:5px 5px 5px 3px;
        display: grid;
        grid-gap:2px;
      }
      section.round{
        cursor: pointer;
        background-color: var(--background-color);
      }
      .un, .rs,.ps,.ts, .mt, .bs, .ou, .mp {
        background-color: var(--background-color);
        text-align: center;
        vertical-align: center;
        font-weight: bold;
      }
      .un {
        grid-area:user
      }

      .rs {
        grid-area:rs;
      }
      .ps {
        grid-area: ps;
      }
      .ts {
        grid-area:ts;
      }
      header.ts {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        border:2px solid var(--accent-color);
        border-radius: 5px;
        margin: 5px 0;
      }


      header.round, section.userround {
        grid-template-columns: 6fr 2fr 1fr 1fr 2fr;
        grid-template-areas:
          "user mp ou ou bs"
          "user mt mt rs rs";
      }
      .mp {
        grid-area: mp;
      }
      .mt {
        grid-area: mt;
      }
      .bs {
        grid-area: bs;
      }
      .ou {
        grid-area: ou;
      }

    `];
  }
  static get properties() {
    return {
      route: {type: Object}, //just use to know when we have been selected
      users: {type: Array}, //to hold full competitions cache result
      rounds: {type: Array} //array of rounds and their names, augmented by user round scores when user is selected
    };
  }
  constructor() {
    super();
    this.route = {active: false};
    this.users = [];
    this.rounds = [];
    this.lastCid = 0;
  }
  connectedCallback() {
    super.connectedCallback();
    this.lastCid = 0;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    if (changed.has('route') && this.route.active) {
        this._newRoute();
    }
    super.update(changed);
  }
  render() {
    return html`
      <football-page heading="Summary">
        <section class="scrollable"> 
          <header class="ts">Total Scores</header>      
          <header class="total">
            <div class="un">Name</div>
            <div class="rs">Round Score</div>
            <div class="ps">Playoff Score</div>
            <div class="ts">Total Score</div>
          </header>
          ${cache(this.users.map(user => html`
            <section class="usertotal ${classMap({me: global.user.uid === user.uid})}">    
              <div class="un" >${user.name}</div>
              <div class="rs" >${user.rscore}</div>
              <div class="ps" >${user.lscore}</div>
              <div class="ts" >${user.tscore}</div>
            </section>
          `))}
          ${cache(this.rounds.map((round,idx) => html`
            <section id="round${round.rid}" class="round" data-rid=${round.rid} @click=${this._gotoRound}>
              <round-header 
                .round=${round} 
                .previous=${idx < this.rounds.length - 1 ? this.rounds[idx + 1].rid : 0} 
                .next=${idx === 0 ? 0: this.rounds[idx-1].rid}
                @round-changed=${this._gotoRoundOnPage}></round-header>
              <header class="round">
                <div class="un">User Name</div>
                <div class="mp">Match Picks</div>
                <div class="ou">${round.ou_round === 1 ? 'Over Under':''}</div>
                <div class="mt">Match Total</div>
                <div class="bs">${round.valid_question === 1 ? 'Bonus Score':''}</div>
                <div class="rs">Round Score</div>
              </header>

              ${cache(round.users.map(user => html`
                <section class="userround ${classMap({me: global.user.uid === user.uid })}">
                  <div class="un">${user.name}</div>
                  <div class="mp">${user.pscore}</div>
                  <div class="ou">${round.ou_round === 1 ? user.oscore: ''}</div>
                  <div class="mt">${user.mscore}</div>
                  <div class="bs">${round.valid_question === 1 ? user.bscore: ''}</div>
                  <div class="rs">${user.score}</div> 
                </section>           
              `))}
            </section>
          `))}

        </section>

      </football-page>
    `;
  
  }
  _gotoRound(e) {
    e.stopPropagation();
    const rid = e.currentTarget.dataset.rid;
    switchPath(`${global.cid}/rounds/${rid}`);
  }
  async _gotoRoundOnPage(e) {
    e.stopPropagation(e);
    const link = `#round${e.changed.rid}`;
    const element = this.shadowRoot.querySelector(link);

    element.scrollIntoView({behaviour: 'smooth', block: 'start'});
  }
  async _newRoute() {
    if (this.lastCid !== global.cid) {  //don't repeat if we don't have to
      this.lastCid = global.cid;
      this.dispatchEvent(new WaitRequest(true));
      const response = await api(`user/${global.cid}/competition_scores`);
      this.dispatchEvent(new WaitRequest(false));
      //users and their total scores
      const map = new Map();
      response.cache.users.forEach(user => map.set(user.uid, user)); //user ordered ones first
      response.users.forEach(user => map.set(user.uid, {...map.get(user.uid), ...user}));
      this.users = Array.from(map.values());
      
      this.rounds = response.rounds;
      for(const round of this.rounds) {
        round.users = response.cache.rounds.filter(r => r.rid === round.rid).sort((a,b) => b.score - a.score)
          .map(rnd => Object.assign({},rnd,{name:map.get(rnd.uid).name}));
      }
    }
  }
}
customElements.define('scores-manager', ScoresManager);