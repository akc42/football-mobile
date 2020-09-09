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

import page from '../styles/page.js';
import emoji from '../styles/emoji.js';

import './list-manager.js';
import './rounds-home-item.js';
import './football-page.js';
import './date-format.js';
import './material-icon.js';

import { switchPath } from '../modules/utils.js';
import global from '../modules/globals.js';


/*
     <rounds-home>
*/
class RoundsHome extends LitElement {
  static get styles() {
    return [page,emoji];
  }
  static get properties() {
    return {
      users: {type: Array},
      round: {type: Object}
    };
  }
  constructor() {
    super();
    this.users = [];
    this.round = {uid:0, name:'', matches:[], options:[], comment:''}
  }
  connectedCallback() {
    super.connectedCallback();
 }
  disconnectedCallback() {
    super.disconnectedCallback();
  }

  firstUpdated() {
  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`

    <style>
      :host {
        --icon-size: 20px;
      }
      #canpick  {
        cursor: pointer;
      }
      #canpick  span {
        font-size: 0.7rem;
      }
      #canpick  material-icon {
        color:  var(--picks-available-color);
      }
      .container {
        background-color:var(--background-color);
        border:2px solid var(--accent-color);
        border-radius: 5px;
        box-shadow: 1px 1px 3px 0px var(--shadow-color);
        margin:5px 5px 5px 3px;
        display: grid;
        grid-gap:2px;
        grid-template-areas:
          "match bonus"
          "points bonus"
          "over bonus"
          "comment bonus"
          "user user"
      }
      .container > div {
        padding: 2px;
      }
      .matches {
        font-weight: bold;
        grid-area: match;
      }
      .points {
        grid-area:points;
      }
      .over {
        grid-area: over;
        font-weight: bold;
      }
      .comment {
        grid-area: comment;
      }
      .bonus {
        grid-area:bonus;
        display: flex;
        flex-direction: column;
      }
      .userhead {
        grid-area: user;
        background-color: var(--accent-color);
        border-top: 2px solid var(--accent-color);
        display: grid;
        grid-gap: 2px;
        grid-template-columns: 2fr repeat(4, 1fr);

      }
      .userhead>* {
        background-color: var(--background-color);
        text-align: center
      }
      .userhead>.mh span {
        color: red;
      }
      .userhead>.tl span {
        color: green;
      }
      .bonus ul {
        list-style-type: none;
        padding: 0;
        margin: 0; 
        font-size: 10px;
      }


    </style>
    <football-page heading="Round Data">
      <div slot="heading">Round ${this.round.rid} - ${this.round.name}</div>
      ${this.iCanPick?html`
        <div id="canpick" slot="heading" @click=${this._makePicks}><material-icon>create</material-icon> <span>Round Picks</span></div>
      `:''}
      <list-manager custom="rounds-home-item"  .items=${this.users} style="${this.round.valid_question === 1? '--list-height:700px':''}">
        <div class="container">
          <div class="matches">Matches ${this.round.matches.length}</div>
          <div class="points"><strong>Points ${this.round.value}</strong><br/>per correct pick (excluding underdog)</div>
          ${this.round.ou_round === 1 ? html`<div class="over"><material-icon>thumbs_up_down</material-icon> <span>Over Under round</span></div>`: ''}
          <div class="emoji comment">${this.round.comment}</div>
          ${this.round.valid_question === 1? html`
            <div class="bonus">
              ${this.round.optionOpen?html`
                <div class="deadline"><material-icon>question_answer</material-icon> Deadline <date-format withTime .date=${this.round.deadline}></date-format></div>
              `:''} 
              <div class="emoji">${this.round.question}></div>
              <ul>
                ${this.round.options.map(option => html`
                  <li>
                    <span>${!this.round.optionOpen && option.opid === this.round.answer?html`
                      <material-icon>check</material-icon>`:html`-`}
                    </span> ${option.label}</li>
                `)}
              </ul>
            </div>
          `:html`<div></div>`}
          <div class="userhead">
            <div class="un">User Name</div>
            <div class="mh">Match <span>(Help?)</span></div>
            <div class="ou">${this.round.ou_round === 1 ?html`<material-icon>thumbs_up_down</material-icon>`:'No O/U'}</div>
            <div class="bn">${this.round.valid_question === 1 ? html`<material-icon>question_answer</material-icon>`:'No Bonus'}</div>
            <div class="tl">Total <span>(Done?)</span></div> 
          </div>
        </div>
      </list-manager>
    </football-page>
    `;
  }
  _makePicks() {
    switchPath(`/${global.cid}/rounds/${this.round.rid}/user/${global.uid}`)
  }
}
customElements.define('rounds-home', RoundsHome);