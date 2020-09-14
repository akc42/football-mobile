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
import './round-match.js';
import './comment-button.js';

import { switchPath } from '../modules/utils.js';
import global from '../modules/globals.js';
import { MatchPick } from '../modules/events.js';


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
      admin: {type:Boolean}, //if set, this is admin able to make picks after cutoff time.
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
    let renderedComment = false;
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
          margin-bottom: 0px;
          list-style-type: none;
        }
        .opheader,section.options {
          background-color: var(--accent-color);
          margin-top: 2px;
          display: grid;
          grid-gap: 1px;
          grid-template-columns: 85px repeat(auto-fit, minmax(20px,1fr));

        }
        .opheader > * , section.options > * , section.pics > * {
          background-color: var(--background-color);
          text-align: center;
        }
        .opheader {
          background-color: var(--accent-color);
        }
        section.options, section.pics {
          border-radius:3px;
          border: 1px solid var(--secondary-color);
          background-color: var(--secondary-color);
          padding: 1px;
          margin: 3px;
        }
        section.options.me, section.pics.me {
          border: 1px solid var(--accent-color);
          background-color: var(--accent-color);

        }
        section.pics {
          margin-top: 2px;
          display: grid;
          grid-gap: 2px;
          margin: 2px;
          grid-template-columns: 1fr repeat(5, 50px);
          grid-template-areas:
            "un away empty empty empty home"
            "un ap empty empty empty hp";
        }
        section.pics.ou {
          grid-template-areas:
            "un away ul empty ol home"
            "un ap under empty over hp";
        }
        .pics .un {
          grid-area: un;
        }
        .away {
          grid-area: away;
        }
        .ul {
          grid-area: ul;
          font-size: 0.8rem;
        }
        .ol {
          grid-area: ol;
          font-size: 0.8rem;
        }
        .home {
          grid-area: home;
        }
        .ap {
          grid-area: ap;
        }
        .under {
          grid-area: under
        }
        .empty {
          grid-area: empty;
        }
        .over {
          grid-area: over;
        }
        .hp {
          grid-area: hp;
        }
        .options .un material-icon {
          color: var(--create-item-color);
          cursor: pointer;
        }
        .pt {
          cursor: pointer;
        }
      </style>
      <football-page heading="Round Data" ?nohead=${this.admin}>
        <round-header .round=${this.round} .next=${this.next} .previous=${this.previous}></round-header>
        <header class="rs" @click=${this._gotoRound}>
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
                    <div>Points ${this.round.bvalue}</div>
                    ${this.options.map(option => html`<material-icon class="C${option.opid % 6}">stop</material-icon>`)}
                  </div>
                </header>
                ${cache(this.users.map(user => html`
                  <section class="options ${classMap({me: user.uid === global.user.uid})}">
                    <div class="un">${user.name} ${user.uid === global.user.uid && this.round.deadline > cutoff ? html`
                      <material-icon @click=${this._makePicks}>create</material-icon>
                    `:''}</div>
                      ${this.options.map(option => {
                        let shouldRenderComment = false;
                        if (!this.admin && !renderedComment && user.comment !== null && user.comment.length > 0) {
                          renderedComment = true;
                          shouldRenderComment = true;
                        }
                        return option.opid === user.opid ? html`
                        <user-pick
                          ?result=${this.round.answer !== 0}
                          ?correct=${this.round.answer === user.opid}
                          ?admin=${user.admin_made === 1}
                          .deadline=${this.round.deadline}
                          .made=${user.submit_time}
                        ></user-pick>`
                          : html`<div data-opid=${option.opid} data-uid=${user.uid} class=${classMap({pt: this.admin})} @click=${this._adminOptionPick}>${shouldRenderComment ? html`<comment-button .comment=${user.comment}></comment-button>`:html`&nbsp;`}</div>`})}
                  </section>
                `))}
            </section>
          `:'')}
          ${cache(this.matches.map(match => html`
            <round-match .round=${this.round} .match=${match}></round-match>
            ${cache(this.users.map(user => {
              const pick = user.picks.find(p => p.aid === match.aid);
              return html`
              <section class="pics ${classMap({
                  me: user.uid === global.user.uid,
                  ou: this.round.ou_round === 1
                })}">
                <div class="un">${user.name} ${pick.comment !== null && pick.comment.length > 0 ? html`
                      <comment-button .comment=${pick.comment}></comment-button>` : ''}</div>
                <div class="away">${match.aid}</div>
                ${this.round.ou_round === 1 ? html`<div class="ul">Under</div><div class="ol">Over</div>`:''}
                <div class="home">${match.hid}</div>
                ${pick !== undefined && pick.pid === match.aid ? html`<user-pick class="ap"
                  ?result=${match.match_time < cutoff}
                  ?correct=${match.ascore > match.hscore}
                  ?admin=${pick.admin_made === 1}
                  .made=${pick.submit_time}
                  .deadline=${match.deadline}></user-pick>`: html`<div 
                    class="ap ${classMap({pt: this.admin})}" 
                    data-aid=${match.aid}
                    data.pid=${match.aid}
                    data.uid=${user.uid}
                    @click=${this._adminMatchResultPick}></div>`}
                ${cache(this.round.ou_round === 1 ? html`
                  ${pick !== undefined && pick.over_selected === 0? html`<user-pick
                    ?result=${match.match_time < cutoff}
                    ?correct=${(match.ascore + match.hscore) < (match.combined_score + 0.5)}
                    ?admin=${pick.admin_made === 1}
                    .made=${pick.submit_time}
                    .deadline=${match.deadline}></user-pick>`:html`<div
                    class="under ${classMap({pt: this.admin})}"
                    data-aid=${match.aid}
                    data.ou="0"
                    data.uid=${user.uid}
                    @click=${this._adminMatchOUPick}></div>`}
                  <div class="empty"></div>
                  ${pick !== undefined && pick.over_selected === 1 ? html`<user-pick
                    ?result=${match.match_time < cutoff}
                    ?correct=${(match.ascore + match.hscore) > (match.combined_score + 0.5)}
                    ?admin=${pick.admin_made === 1}
                    .made=${pick.submit_time}
                    .deadline=${match.deadline}></user-pick>` : html`<div 
                    class="over ${classMap({pt: this.admin})}"
                    data-aid=${match.aid}
                    data.ou="1"
                    data.uid=${user.uid}
                    @click=${this._adminMatchOUPick}></div>`}
                `: html`<div class="empty"></div>`)}
                ${pick !== undefined && pick.pid === match.hid ? html`<user-pick clss="hp"
                  ?result=${match.match_time < cutoff}
                  ?correct=${match.ascore < match.hscore}
                  ?admin=${pick.admin_made === 1}
                  .made=${pick.submit_time}
                  .deadline=${match.deadline}></user-pick>` : html`<div class="hp ${classMap({pt: this.admin})}" 
                    data-aid=${match.aid}
                    data.pid=${match.hid}
                    data.uid=${user.uid}
                    @click=${this._adminMatchResultPick}></div>`}
              </section>
            `}))}
          `))}
        </section>
    </football-page>
    `;
  }
  _adminMatchResultPick(e) {
    e.stopPropagation();
    if (this.admin) {
      const uid = parseInt(e.currentTarget.dataset.uid, 10);
      const aid = parseInt(e.currentTarget.dataset.aid, 10);
      const pid = parseInt(e.currentTarget.dataset.pid, 10)
      const user = this.users.find(user => user.uid === uid);
      if (user !== undefined) {
        let pick = user.picks.find(p => p.aid === match.aid);
        if (pick === undefined) {
          pick = {uid: uid, aid: aid, rid: this.round.rid, comment: null, over_selected: 0 };
        }
        pick.pid = pid;
        this.dispatchEvent(new MatchPick(pick))
      } 
    }
  }
  _adminMatchOUPick(e) {
    if (this.admin) {
      const uid = parseInt(e.currentTarget.dataset.uid, 10);
      const aid = parseInt(e.currentTarget.dataset.aid, 10);
      const ou = parseInt(e.currentTarget.dataset.ou, 10)
      const user = this.users.find(user => user.uid === uid);
      if (user !== undefined) {
        let pick = user.picks.find(p => p.aid === match.aid);
        if (pick === undefined) {
          pick = { uid: uid, aid: aid, rid: this.round.rid, comment: null, pid: aid};
        }
        pick.over_selected = ou;
        this.dispatchEvent(new MatchPick(pick));
      }
    }
  }
  _gotoRound(e) {
    e.stopPropagation();
    switchPath(`/${global.cid}/scores`, {round: this.round.rid});
  }
  _makePicks(e) {
    e.stopPropagation()
    switchPath(`/${global.cid}/rounds/${this.round.rid}/user`)
  }
}
customElements.define('rounds-home', RoundsHome);
