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
import {cache} from '../libs/cache.js'
import {classMap} from '../libs/class-map.js';

import page from '../styles/page.js';
import emoji from '../styles/emoji.js';
import opids from '../styles/opids.js';

import './football-page.js';
import './date-format.js';
import './material-icon.js';
import './round-header.js';
import './user-pick.js';
import './fm-match.js';
import './comment-button.js';

import { switchPath } from '../modules/utils.js';
import global from '../modules/globals.js';


/*
     <rounds-home>
*/
class RoundsHome extends LitElement {
  static get styles() {
    return [page,emoji,opids,css``];
  }
  static get properties() {
    return {
      users: {type: Array},
      round: {type: Object},
      matches: {type: Array},
      options: {type: Array},
      next: {type: Number},
      previous: {type: Number}
    };
  }
  constructor() {
    super();
    this.users = [];
    this.round = {rid:0, name:''};
    this.matches = [];
    this.options = [];
    this.next = 0;
    this.previous = 0;

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
    const cutoff = Math.floor(new Date().getTime()/1000);
    return html`
      <style>
        :host {
          --icon-size: 20px;
        }

        header.rs, header.bonus {
          background-color:var(--accent-color);
          border:2px solid var(--accent-color);
          border-radius: 5px;
          margin: 3px;
          display: flex;
          flex-direction: column;
          padding: 1px;
        }

        .points, .excl, .rcom, ul, .rq {
          background-color: var(--background-color);
        }
        .points {
          text-align: center;
          font-weight: bold;
        }
        .excl {
          text-align: center;
        }
        .rcom {
          margin-top: 1px;
          padding: 2px;
        }
        header.bonus ul {
          margin-top: 1px;
          list-style-type: none;
        }
        .opheader,section.options {
          background-color: var(--accent-color);
          margin-top: 2px;
          display: grid;
          grid-gap: 1px;
          grid-template-columns: 85px repeat(auto-fit, minmax(20px,1fr));

        }
        .opheader > * , section.options > *{
          background-color: var(--background-color);
        }
        .opheader {
          background-color: var(--accent-color);
        }
        section.options {
          border-radius:3px;
          border: 1px solid var(--secondary-color);
          background-color: var(--secondary-color);
          padding: 1px;
        }
        section.options.me {
          border: 1px solid var(--accent-color);
          background-color: var(--accent-color);

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
        .picks {
          display: grid;
          grid-gap: 2px;
          grid-template-columns: 75px 1fr 1fr;
          grid-template-areas:
            "user pa ph"
            "user oua ouh";
        }

      </style>
      <football-page heading="Round Data">
        <round-header .round=${this.round} .next=${this.next} .previous=${this.previous}></round-header>
        <header class="rs">
          <div class="points">Points ${this.round.value}</div>
          <div class="excl">(excluding underdog points)</div>
           ${this.round.comment && this.round.comment.length > 0 ? html`
            <div class="emoji rcom">${this.round.comment}</div>
           `:''}
        </header>
        <section class="scrollable">
          ${cache(this.round.valid_question === 1 ? html`
            <section class="bonus">
                <header class="bonus">
                  <div class="emoji rq">${this.round.question}></div>

                  <ul >
                    ${this.options.map(option => html`
                      <li>
                        <span>${!this.round.optionOpen && option.opid === this.round.answer ? html`
                          <material-icon class="C${option.opid%6}">check</material-icon>`: 
                      html`<material-icon class="C${option.opid % 6}">stop</material-icon>`}
                        </span> ${option.label}</li>
                    `)}
                  </ul>
                  ${this.round.optionOpen ? html`
                    <div class="deadline">
                      <material-icon>question_answer</material-icon> Deadline <date-format withTime .date=${this.round.deadline}></date-format>
                    </div>
                  `: ''} 
                  <div class="opheader">
                    <div>&nbsp;</div>
                    ${this.options.map(option => html`<material-icon class="C${option.opid % 6}">stop</material-icon>`)}
                  </div>
                </header>
                ${cache(this.users.map(user => html`
                  <section class="options ${classMap({me: user.uid === global.user.uid})}">
                    <div class="un">${user.name} ${user.comment !== null && user.comment.length > 0 ? html`
                      <comment-button .comment=${user.comment}></comment-button>`:''}</div>
                      ${this.options.map(option => option.opid === user.opid ? html`
                        <user-pick
                          ?result=${this.round.answer !== 0}
                          ?correct=${this.round.answer === user.opid}
                          ?admin=${user.admin_made === 1}
                          .deadline=${this.round.deadline}
                          .made=${user.submit_time}
                        ></user-pick>`
                      :html`<div>&nbsp;</div>`)}
                  </section>
                `))}
            </section>
          `:'')}
          ${cache(this.matches.map(match => html`
            <fm-match .round=${this.round} .match=${match}></fm-match>
            ${cache(this.users.map(user => {
              const pick = user.picks.find(p => p.aid === match.aid);        
              return html`
              <section class="pics">
                <div class="un">${user.name} ${pick.comment !== null && pick.comment.length > 0 ? html`
                      <comment-button .comment=${pick.comment}></comment-button>` : ''}</div>
                ${pick !== undefined && pick.pid === match.aid ? html`<user-pick clss="ap"
                  ?result=${match.match_time < cutoff}
                  ?correct=${match.ascore > match.hscore}
                  ?admin=${pick.admin_made === 1}
                  .made=${pick.submit_time}
                  .deadline=${match.deadline}></user-pick>`: html`<div class="ap"></div>`}
                
              </section>
            `}))}
          `))}     
        </section>
    </football-page>
    `;
  }
  _makePicks() {
    switchPath(`/${global.cid}/rounds/${this.round.rid}/user/${global.uid}`)
  }
}
customElements.define('rounds-home', RoundsHome);