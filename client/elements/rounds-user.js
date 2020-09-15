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
import {guard} from '../libs/guard.js';

import page from '../styles/page.js';
import emoji from '../styles/emoji.js';
import opids from '../styles/opids.js';

import './football-page.js';
import './date-format.js';
import './material-icon.js';
import './round-header.js';
import './user-pick.js';
import './user-match.js';
import './comment-button.js';

import { switchPath } from '../modules/utils.js';
import global from '../modules/globals.js';
import { OptionPick } from '../modules/events.js';


/*
     <rounds-user>
*/
class RoundsUser extends LitElement {
  static get styles() {
    return [page,emoji,opids,css``];
  }
  static get properties() {
    return {
      user: {type: Array},
      round: {type: Object},
      matches: {type: Array},
      options: {type: Array},
      timeLeft: {type: String} //timeLeft to make option Picks
    };
  }
  constructor() {
    super();
    this.users = [];
    this.round = {rid:0, name:'', valid_question: 0};
    this.matches = [];
    this.options = [];
    this.next = 0;
    this.previous = 0;
    this.timeLeft = '';
    this.timer = 0;

  }
  connectedCallback() {
    super.connectedCallback();
    if (this.round.valid_question === 1) {
      const cutoff = Math.floor(new Date().getTime() / 1000);
      this.seconds = this.round.deadline - cutoff;
      this.timeLeft = '';
      if (this.seconds > 0) {
        this.timeLeft = this.toHHMMSS(this.seconds);
        this.timer = setInterval(() => {
          this.seconds--;
          if (this.seconds >= 0) {
            this.timeLeft = this.toHHMMSS(this.seconds);
          } else {
            clearInterval(this.timer);
          }
        }, 1000);
      }
    }
 }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.timer !== 0) {
      clearInterval(this.timer);
      this.timer = 0;
      this.timeLeft = '';
    }
  }
  update(changed) {
    if (changed.has('round') && this.round.valid_question === 1 && 
      (changed.get('round') === undefined || changed.get('round').deadline !== this.round.deadline)) {
      if (this.timer !== 0) {
        clearInterval(this.timer);
      }
      //start a new count down as the deadline has changed.
      const cutoff = Math.floor(new Date().getTime() / 1000);
      this.seconds = this.round.deadline - cutoff;
      this.timeLeft = '';
      if (this.seconds > 0) {
        this.timeLeft = this.toHHMMSS(this.seconds);
        this.timer = setInterval(() => {
          this.seconds--;
          if (this.seconds >= 0) {
            this.timeLeft = this.toHHMMSS(this.seconds);
          } else {
            clearInterval(this.timer);
          }
        }, 1000);
      }
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
        .opheader > * , section.options > * , .deadline {
          background-color: var(--background-color);
          text-align: center;
        }
        .opheader {
          background-color: var(--accent-color);
        }
        section.options {
          border-radius:3px;
          border: 1px solid var(--accent-color);
          background-color: var(--accent-color);
          padding: 1px;
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
        .pt {
          cursor: pointer;
        }
        .deadline {
          margin-top: 1px;
        }
        .deadline material-icon {
          color: var(--item-present);
        }
      </style>
      <football-page heading="Make Picks">
        <round-header .round=${this.round} .next=${0} .previous=${0}></round-header>
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
                  <div class="emoji rq">${this.round.question}</div>

                  <ul >
                    ${guard(this.options, () => this.options.map(option => html`
                      <li>
                        <span>${!this.round.optionOpen && option.opid === this.round.answer ? html`
                          <material-icon class="C${option.opid%6}">check</material-icon>`:
                      html`<material-icon class="C${option.opid % 6}">stop</material-icon>`}
                        </span> ${option.label}</li>
                    `))}
                  </ul>
                    <div class="deadline">
                      <material-icon>question_answer</material-icon> Deadline <date-format withTime .date=${this.round.deadline}></date-format>
                    </div>
                  <div class="opheader">
                    <div>Points ${this.round.bvalue}</div>
                    ${guard(this.options, () => this.options.map(option => html`<material-icon class="C${option.opid % 6}">stop</material-icon>`))}
                  </div>
                </header>

                  <section class="options">
                    <div class="un">Time Left ${this.timeLeft}</div>
                      ${guard([this.options,this.user.opid], () => this.options.map(option => option.opid === this.user.opid ? html`
                        <user-pick
                          ?admin=${this.user.admin_made === 1}
                          .deadline=${this.round.deadline}
                          .made=${this.user.submit_time}
                        ></user-pick>`
                          : html`<div class="pt" data-opid=${option.opid} @click=${this._optionPick}>&nbsp;</div>`))}

                    
                  </section>
                  <div class="oc">
                    ${guard([this.user.comment], () => html``)}
                    <fm-input label="Option Comment" textarea id="comment" .value=${this.user.comment} @blur=${this._updateComment} ></fm-input>
                  </div>
            </section>
          `:'')}
          ${guard([this.matches,this.user], () => this.matches.map(match => {
            const pick = this.user.picks.find(p => p.aid === match.aid);
            return html`
              <user-match .round=${this.round} .match=${match} .pick=${pick}></user-match>
             `;
          }))}
        </section>
    </football-page>
    `;
  }
  toHHMMSS(secs) {
    const sec_num = parseInt(secs, 10)
    const hours = Math.floor(sec_num / 3600)
    const minutes = Math.floor(sec_num / 60) % 60
    const seconds = sec_num % 60

    return [hours, minutes, seconds]
      .map(v => v < 10 ? "0" + v : v)
      .filter((v, i) => v !== "00" || i > 0)
      .join(":")
  }
  _optionPick(e) {
    e.stopPropagation();
    const cutoff = Math.floor(new Date().getTime() / 1000);
    if (cutoff < this.round.deadline) {
      const opid = parseInt(e.currentTarget.dataset.opid,10);
      this.user.opid = opid;
      this.dispatchEvent(new OptionPick({uid: global.user.uid, rid: this.round.rid,comment: this.user.comment,opid: opid }))
    }
  }
  _updateComment(e) {
    e.stopPropagation();
    const cutoff = Math.floor(new Date().getTime() / 1000);
    if (cutoff < this.round.deadline && this.user.comment !== e.currentTarget.value) {
      this.user.comment = e.currentTarget.value;
      this.dispatchEvent(new OptionPick({ uid: global.user.uid, rid: this.round.rid, comment: this.user.comment, opid: this.user.opid }));
    }
  }
}
customElements.define('rounds-user', RoundsUser);
