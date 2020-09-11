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

import global from '../modules/globals.js';
import emoji from '../styles/emoji.js';

import './material-icon.js';
import './calendar-input.js';
import './date-format.js';
import './fm-checkbox.js';
import './comment-button.js';

import {InputRequest, TeamDeselected, MatchChanged, MatchSwap} from '../modules/events.js';
import { switchPath } from '../modules/utils.js';


/*
     <fm-match>
*/
class FmMatch extends LitElement {
  static get styles() {
    return [emoji,css``];
  }
  static get properties() {
    return {
      round: {type: Object},
      match: {type: Object},
      edit: {type: Boolean} //set if editable (by admin)
    };
  }
  constructor() {
    super();
    this.round = {rid:0}
    this.match = {cid: global.cid, rid:this.round.rid, aid:''}
    this.edit = false;
    this._inputReply = this._inputReply.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('input-reply', this._inputReply);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('input-reply', this._inputReply);
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
    const cutoff = Math.floor(new Date().getTime() / 1000);
    return html`
      <style>
        section {
          display: grid;
          grid-gap: 2px;
          border: 2px solid var(--accent-color);
          border-radius: 4px;
          margin: 2px;
          background-color: var(--accent-color);
          grid-template-columns: repeat(5, 50px);
          grid-template-rows: 1fr 1fr;
          grid-template-areas:
            "aid ascore at hscore hid"
            "aid aunder cscore hunder hid"
            "mt mt mt mt mt";

        }
        section.comment {
          grid-template-columns: 75px repeat(5, 50px);
          grid-template-areas:
            "comment aid ascore at hscore hid"
            "comment aid aunder cscore hunder hid"
            "comment mt mt mt mt mt";

        }
        .team, .score, .at, .under, .mt, .cmt {
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
          height: 100%;
          overflow-y: auto;
        }
  
      </style>
      <section class=${classMap({comment: this.match.comment !== null && this.match.comment.length > 0})}>
        ${cache(this.match.comment !== null && this.match.comment.length > 0 ? html`
          <div class="emoji">${this.match.comment}</div>
        `:'')}
        <div class="team aid">
          <img src="/appimages/teams/${this.match.aid}.png" alt="${this.match.aname} team logo"/>
          <div class="sname">${this.match.aid}</div>
          <material-icon class="${classMap({ pt: this.edit})}" @click=${this._deselectAid}>close</material-icon>
        </div>
        <div class="score ascore ${classMap({ pt: this.edit })}" @click=${this._setAscore}>
          <div class="title">Score</div>
          <div class="num">${this.match.ascore}</div>
        </div>
        <div class="under aunder ${classMap({ pt: this.edit })}"  @click=${this._makeUnderAid}>
          <div class="dog">Underdog</div>
          <div class="num">${this.match.underdog < 0 ? -this.match.underdog: ''}</div>
        </div>
        <div class="at ${classMap({pt: (this.edit && this.match.hid !== null && this.match.hid.length > 0) ||
          this.match.deadline > cutoff })}" @click=${this._swapTeams}>
          ${cache(this.edit ? html`
            <div class="title">Swap</div>
          `: this.match.deadline > cutoff ? html`
            <div class="title"><material-icon>create</material-icon> Pick</div>
          ` : '')}
          <div class="num">@</div>          
        </div>
        <div class="score cscore ${classMap({ou: this.round.ou_round === 1})}" @click=${this._setCombinedScore}>
          ${cache(this.round.ou_round === 1 ? html`
            <div class="title">OU Score</div>
            <div class="num">${this.match.combined_score === null ? '' : this.match.combined_score + .5}</div>
          `:'')}
        </div>
        <div class="score hscore ${classMap({ pt: this.edit })}" @click=${this._setHscore}>
          <div class="title">Score</div>
          <div class="num">${this.match.hscore}</div>
        </div>
        <div class="under hunder ${classMap({ pt: this.edit })}"  @click=${this._makeUnderHid}>
          <div class="dog">Underdog</div>
          <div class="score">${this.match.underdog > 0 ? this.match.underdog : ''}</div>
        </div>
        <div class="team hid">
          ${cache(this.match.hid !==null && this.match.hid.length > 0 ? html`
            <img src="/appimages/teams/${this.match.hid}.png" alt="${this.match.hname} team logo"/>
            <div class="sname">${this.match.hid}</div>
            <material-icon class="${classMap({ pt: this.edit })}" @click=${this._deselectHid}>close</material-icon>    
          `:'')}
        </div>
        <div class="mt">
          ${this.edit ? html`
            <calendar-input .value=${this.match.match_time} withTime @value-changed=${this._newMatchTime}></calendar-input>
            <div class="misc">
              <fm-checkbox .value=${this.match.open} @value-changed=${this._setOpen}>Open</fm-checkbox>
              <comment-button edit class="match" .comment=${this.match.comment} @comment-changed=${this._commentChanged}></comment-button> 
            </div>
          `: html`
            <date-format .date=${this.match.match_time} withTime></date-format>
          `} 
        </div>
      </section>
    `;
  }
  _commentChanged(e) {
    e.stopPropagation();
    if(this.match.comment != e.changed) {
      this.match.comment = e.changed;
      if (this.edit) this.dispatchEvent(new MatchChanged({rid: this.round.rid, aid: this.match.aid, comment:this.match.comment}));
    }
  }
  _deselectAid(e) {
    e.stopPropagation();
    if (this.edit) this.dispatchEvent(new TeamDeselected(this.match.aid));
  }
  _deselectHid(e) {
    e.stopPropagation();
    if (this.edit) this.dispatchEvent(new TeamDeselected(this.match.hid));
  }
  _inputReply(e) {
    e.stopPropagation();
    if (this.edit) {
      if (e.reply.field === 'underdog' && this.match.underdog < 0) {
        this.match.underdog = -e.reply.value;
      } else {
        this.match[e.reply.field] = e.reply.value;
      }
      const params = { rid: this.round.rid, aid: this.match.aid };
      params[e.reply.field] = this.match[e.reply.field];
      this.dispatchEvent(new MatchChanged(params));
    }
  }
  async _makeUnderAid(e) {
    e.stopPropagation();
    if (this.edit) {
      this.match.underdog = -Math.max(1, this.match.underdog);
      await this.requestUpdate();
      const dog = this.shadowRoot.querySelector('.dog');
      dog.dispatchEvent(new InputRequest({field: 'underdog', value: -this.match.underdog}))
    }
  }
  async _makeUnderHid(e) {
    e.stopPropagation();
    if (this.edit) {
      this.match.underdog = -Math.min(-1, this.match.underdog);
      await this.requestUpdate();
      const dog = this.shadowRoot.querySelector('.dog');
      dog.dispatchEvent(new InputRequest({ field: 'underdog', value: this.match.underdog }))
    }
  }
  async _newMatchTime(e) {
    e.stopPropagation();
    if (this.edit) {
      this.match.match_time = e.changed;
      this.dispatchEvent(new MatchChanged({rid: this.round.rid, aid: this.match.aid, match_time: this.match.match_time}));
    }
  }
  _setAscore(e) {
    e.stopPropagation();
    if (this.edit) e.currentTarget.dispatchEvent(new InputRequest({ field: 'ascore', value: this.match.ascore }));
  }
  _setCombinedScore(e) {
    e.stopPropagation();
    if (this.edit && this.round.ou_round === 1) {
      e.currentTarget.dispatchEvent(new InputRequest({ field: 'combined_score', value: this.match.combined_score}));
    }
  }
  _setHscore(e) {
    e.stopPropagation();
    if (this.edit) e.currentTarget.dispatchEvent(new InputRequest({ field: 'hscore', value: this.match.hscore }));
  }
  async _setOpen(e) {
    e.stopPropagation();
    if (this.edit) {
      this.match.open = e.changed? 1:0;
      this.dispatchEvent(new MatchChanged({ rid: this.round.rid, aid: this.match.aid, open: this.match.match_time }));
    }
  }
  _swapTeams(e) {
    e.stopPropagation();
    if (this.edit && this.match.hid !== null && this.match.hid.length > 0) {
      this.dispatchEvent(new MatchSwap({rid: this.round.rid, aid: this.match.aid}))
    } else {
      const cutoff = Math.floor(new Date().getTime() / 1000);
      if (this.match.deadline > cuttoff) switchPath(`/${global.cid}/rounds/${this.round.rid}/match`);
    }
  }
}
customElements.define('fm-match', FmMatch);