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
import {guard} from '../libs/guard.js';

import global from '../modules/globals.js';
import emoji from '../styles/emoji.js';

import './material-icon.js';
import './date-format.js';
import './comment-button.js';
import './user-pick.js';
import './fm-input.js';

import {OptionPick, MatchPick} from '../modules/events.js';
import { switchPath } from '../modules/utils.js';


/*
     <fm-match>
*/
class UserMatch extends LitElement {
  static get styles() {
    return [emoji,css`
        section {
          display: grid;
          grid-gap: 2px;
          border: 2px solid var(--accent-color);
          border-radius: 4px;
          margin: 2px;
          background-color: var(--accent-color);
          grid-template-rows: 1fr 1fr;
          grid-template-columns: 1fr repeat(5, 50px);
          grid-template-areas:
            "comment aid ascore at hscore hid"
            "comment aid aunder cscore hunder hid"
            "comment mt mt mt mt mt"
            "pc pc pc pc pc pc";
        }

        .team, .score, .at, .under, .mt, .cmt, .pc {
          background-color: var(--background-color);
        }
        .num {
          font-weight: bold;
          font-size: 1.3rem;
          text-align: center;
        }
        .team, .score, .under, .at, .misc {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          align-items: center;
        }
        .pt {
          cursor: pointer;
        }
        .dog, .title {
          font-size:0.5rem;
        }

        .aid {
          grid-area: aid;
        }
        .ascore {
          grid-area: ascore;
        }
        .at {
          grid-area: at;
          position: relative;
        }
        .at .under, .at .over {
          position: absolute;
        }
        .at .under {
          left: 0;
          top: 0;
        }
        .at .over {
          right: 0;
          top: 0;
        }
        .at .dog {
          text-align: center;
          margin: 0 auto;

        }
        .match {
          text-align: right;
        }
        .hscore {
          grid-area: hscore;
        }
        .hid {
          grid-area: hid;
        }
        .aunder {
          grid-area: aunder;
        }
        .cscore {
          grid-area: cscore;
        }
        .hunder {
          grid-area: hunder;
        }
        .mt {
          grid-area: mt;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items: center;
        }
        .mt > div {
          margin-right:2px;
        }
        .misc {
          display: flex;
          flex-direction: column;
          justify-content:space-between;
          align-items: flex-start;
        }
        .title > material-icon {
          color: var(--pick-available-color);
        }
        .emoji {
          grid-area: comment;
          height: 126px;
          overflow-y: auto;
          background-color: var(--background-color);
        }
        .pc {
          grid-area: pc;
        }
    
    `];
  }
  static get properties() {
    return {
      round: {type: Object},
      match: {type: Object},
      pick: { type: Object },
      timeLeft: { type: String } //timeLeft to make option Picks
    };
  }
  constructor() {
    super();
    this.round = {rid:0}
    this.match = {cid: global.cid, rid:this.round.rid, aid:'', deadline: 0}
    this.pick = {uid: global.user.uid, cid: global.cid, rid: this.round.rid, aid: this.match.aid, pid: null, over_selected: null, comment: null}
    this.timeLeft = '';
    this.timer = 0;
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.match.deadline > 0) {
      const cutoff = Math.floor(new Date().getTime() / 1000);
      this.seconds = this.match.deadline - cutoff;
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
  update(changed) {
    if (this.pick === undefined) {
      this.pick = { uid: global.user.uid, cid: global.cid, rid: this.round.rid, aid: this.match.aid, pid: null, over_selected: null, comment: null };
    }
    if (changed.has('match') && this.match.deadline > 0 && 
      (changed.get('match') === undefined || changed.get('match').deadline !== this.match.deadline)) {
      if (this.timer !== 0) {
        clearInterval(this.timer);
      }
      //start a new count down as the deadline has changed.
      const cutoff = Math.floor(new Date().getTime() / 1000);
      this.seconds = this.match.deadline - cutoff;
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
  render() {
    return html`

      <section>
        ${guard([this.match, this.pick], () => html`
          <div class="emoji">${this.match.comment !== null && this.match.comment.length > 0 ? this.match.comment : ''}</div>
          <div class="team aid">
            <img src="/appimages/teams/${this.match.aid}.png" alt="${this.match.aname} team logo" />
            <div class="sname">${this.match.aid}</div>
          </div>
          <div class="score ascore pt" @click=${this._setAscore}>
            <div class="title">Winner</div>
            <div class="num">
              ${this.pick.pid === this.match.aid ? html`
              <user-pick ?admin=${this.pick.admin_made===1} .deadline=${this.match.deadline} .made=${this.pick.summit_time}>
              </user-pick>
              `: ''}
            </div>
          </div>
          <div class="under aunder ${classMap({ pt: this.round.ou_round === 1 })}" @click=${this._makeUnderAid}>
            ${this.round.ou_round === 1 ? html`
            <div class="num">${this.pick.over_selected === 0 ? html`
              <user-pick ?admin=${this.pick.admin_made===1} .deadline=${this.match.deadline} .made=${this.pick.summit_time}>
              </user-pick>
              `: ''}
            </div>
            `: ''}
          </div>
          <div class="at">          
            ${this.match.underdog < 0 ? html` <div class="under">${-this.match.underdog}</div>` : ''}
          <div class="num">@</div>
          ${this.match.underdog > 0 ? html`
          <div class="over">${this.match.underdog}</div>` : ''}
          ${this.match.underdog !== 0 ? html`<div class="dog">Underdog</div>` : ''}
          </div>
          <div class="score cscore ${classMap({ ou: this.round.ou_round === 1 })}">
            ${cache(this.round.ou_round === 1 ? html`
            <div class="title">OU Score</div>
            <div class="num">${this.match.combined_score === null ? '' : this.match.combined_score + .5}</div>
            `: '')}
          </div>
          <div class="score hscore pt" @click=${this._setHscore}>
            <div class="title">Winner</div>
            <div class="num">
              ${this.pick.pid === this.match.hid ? html`
              <user-pick ?admin=${this.pick.admin_made===1} .deadline=${this.match.deadline} .made=${this.pick.summit_time}>
              </user-pick>
              `: ''}
            </div>
          </div>
          <div class="under hunder ${classMap({ pt: this.round.ou_round === 1 })}" @click=${this._makeUnderHid}>
            ${this.round.ou_round === 1 ? html`
            <div class="num">${this.pick.over_selected === 1 ? html`
              <user-pick ?admin=${this.pick.admin_made===1} .deadline=${this.match.deadline} .made=${this.pick.summit_time}>
              </user-pick>
              `: ''}
            </div>
            `: ''}
          </div>
          <div class="team hid">
            ${cache(this.match.hid !== null && this.match.hid.length > 0 ? html`
            <img src="/appimages/teams/${this.match.hid}.png" alt="${this.match.hname} team logo" />
            <div class="sname">${this.match.hid}</div>
            `: '')}
          </div>
          
        
        `)}
        <div class="mt">
          ${guard(this.match.match_time, () => html`<date-format .date=${this.match.match_time} withTime></date-format>`)} 
          <div>${this.timeLeft}</div>
        </div>
        <div class="pc">
          ${guard(this.pick.comment, () => html`
            <fm-input textarea label="Your Match Comment" .value=${this.pick.comment} @blur=${this._updateComment}></fm-input>
          `)}
          
        </div>
      </section>
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
  async _makeUnderAid(e) {
    e.stopPropagation();
    const cutoff = Math.floor(new Date().getTime() / 1000);
    if (cutoff < this.match.deadline && tmatchou_round === 1) {
      this.pick.over_selected = 0;  
      this.dispatchEvent(new MatchPick(this.pick));
    }
  }
  async _makeUnderHid(e) {
    e.stopPropagation(); 
    const cutoff = Math.floor(new Date().getTime() / 1000);
    if (cutoff < this.match.deadline && this.round.ou_round === 1) {
      this.pick.over_selected = 1;
      this.dispatchEvent(new MatchPick(this.pick));
    }
  }
  _setAscore(e) {
    e.stopPropagation();
    const cutoff = Math.floor(new Date().getTime() / 1000);
    if (cutoff < this.match.deadline) {
      this.pick.pid = this.match.aid;
      this.dispatchEvent(new MatchPick(this.pick));
    }
  }
  _setHscore(e) {
    e.stopPropagation();
    const cutoff = Math.floor(new Date().getTime() / 1000);
    if (cutoff < this.match.deadline) {
      this.pick.pid = this.match.hid;
      this.dispatchEvent(new MatchPick(this.pick));
    }
  }
  _updateComment(e) {
    e.stopPropagation();
    const cutoff = Math.floor(new Date().getTime() / 1000);
    if (cutoff < this.match.deadline && e.currentTarget.value !== this.pick.comment) {
      this.pick.comment = e.currentTarget.value;
      this.dispatchEvent(new MatchPick(this.pick));
    }
  }
}
customElements.define('user-match', UserMatch);
