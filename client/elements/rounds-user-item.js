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

import {  MatchPick } from '../modules/events.js';
import global from '../modules/globals.js';
import './comment-button.js';


/*
     <round-user-item>: This is a set of matches with results or ability to pick;
*/
class RoundsUserItem extends LitElement {
  static get styles() {
    return css`      
      :host {
        background-color: var(--accent-color); 
        border: 2px solid var(--accent-color);
        display: grid;
        grid-gap:2px;
        grid-template-columns: repeat(7, 1fr);
        grid-template-areas:
          "aid ascore ascore at hid hscore hscore"
          "aid aresult apick pscore hid hresult hpick"
          "boundary combined underp oscore actual total overp";
      }




      .team, .score, .at, .result, .pick, .underp, .overp, .label {
        padding:2px;
        background-color: var(--background-color);
        text-align: center;
        vertical-align: center;
      }
      .aid {
        grid-area:aid;
      }
      .hid {
        grid-area: hid;
      }
      .pscore {
        grid-area: pscore;
      }
      .team {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
      }
      .ascore {
        grid-area: ascore;
      }
      .hscore {
        grid-area: hscore;
      }
      .aresult {
        grid-area: aresult;
        color: var(-fm-win-color);
      }
      .hresult {
        grid-area: hresult;
        color: var(fm-win-color);
      }
      .apick {
        grid-area: apick;
      }
      .hpick {
        grid-area: hpick;
      }
      .boundary {
        grid-area: boundary;
      }
      .underp {
        grid-area: underp;
      }
      .oscore {
        grid-area: oscore;
      }
      .total {
        grid-area: total;
      }
      .overp {
        grid-area: overp;
      }
      .score {
        font-weight: bold;
        font-size: 1.5rem;
      }
      .at {
        grid-area: auto;
        font-weight: bold;
        font-size: 1.5rem;
      }
      .overp, .underp {
        display: flex;
        flex-direction: column;
      }
      .overp user-pick, .overp .fill, .underp user-pick, .underp .fill {
        flex: 1;
      }
      .overp .label, .underp .label {
        font-size: 0.5rem;
        font-variant: small-caps;
      }
      .underdog {
          font-size: 0.5rem;
          background-color: var(--accent-color);
      }
      .underdog > span {
        font-size: 0.6rem;
        margin-left: 10px;
      }
      .at, .pscore {
        position:relative
      }
      .at > .match, .pscore > .user {
        position:absolute;
        bottom: 2px;
        right: 2px;
      }
      .editable {
        cursor: pointer;
      }
      .at.open {
        background-color: var(--fm-pick-open);
      }
    `;
  }
  static get properties() {
    return {
      item: {type: Object}
    };
  }
  constructor() {
    super();
    this.item = {deadline:0};
  }

  render() {
    //work out if this match is open
    const canPick = this._canPick();  
    return html`
      <style>


      </style>
        
        <div class="team aid">
          <img src="/appimages/teams/${this.item.aid}.png" alt="${this.item.aname} team logo"/>
          <div class="sname">${this.item.aid}</div>
          ${cache(this.item.underdog < 0 ? html`<div class="underdog">Underdog <span>${-this.item.underdog}</span></div>`:'')}
        </div>
        <div class="score ascore">${this.item.ascore}</div>
        <div class="result aresult">${this.item.ascore >= this.item.hscore?html`<material-icon>emoji_events</material-icon>`:'' }</div>
        ${cache(this.item.aid === this.item.pid?html`
          <user-pick 
            class="pick apick"
            ?admin=${this.item.admin_made === 1}
            ?correct=${this.item.ascore >= this.item.hscore}
            .deadline=${this.item.dedline}
            .made=${this.item.submit_time}
            ?result=${this.item.ascore !== null && this.item.hscore !==null}
            ></user-pick>
        `:html`
          <div class="pick apick ${classMap({editable: canPick})}" @click=${this._pickAid}></div>
        `)}
        <div class="at ${classMap({open: canPick})}">@${this.item.comment !== null ?
          html`<comment-button class="match" .comment=${this.item.comment}></comment-button>`:''}</div>
        <div class="score pscore">${this.item.pscore}${this.item.userComment !== null || canPick? 
          html`<comment-button class="user" .comment=${this.item.userComment} ?edit=${canPick} @comment-reply=${this._commentReply}></comment-button>` : ''}</div>
        <div class="team hid">
          <img src="/appimages/teams/${this.item.hid}.png"  alt="${this.item.hname} team logo"/>
          <div class="sname">${this.item.hid}</div>
           ${cache(this.item.underdog > 0 ? html`<div class="underdog">Underdog <span>${this.item.underdog}</span></div>` : '')}
        </div>
        <div class="score hscore">${this.item.hscore}</div>
        <div class="result hresult">${this.item.ascore <= this.item.hscore ? html`<material-icon>emoji_events</material-icon>` : '' }</div>
        ${cache(this.item.hid === this.item.pid ? html`
          <user-pick 
            class="pick hpick"
            ?admin=${this.item.admin_made === 1}
            ?correct=${this.item.ascore <= this.item.hscore}
            .deadline=${this.item.deadline}
            .made=${this.item.submit_time}
            ?result=${this.item.ascore !== null && this.item.hscore !== null}></user-pick>
        `: html`
          <div class="pick hpick ${classMap({ editable: canPick })}" @click=${this._pickHid}></div>
        `)}
        ${cache(this.item.ouRound ? html`
          <div class="boundary label">OU Boundary</div>
          <div class="score combined">${(this.item.combined_score + 0.5).toFixed(1)}</div>
          <div class="underp ${classMap({ editable: canPick })}" @click=${this._pickUnder}>
            ${cache(this.item.over_selected === 0 ? html`
              <user-pick
                  ?admin=${this.item.admin_made === 1}
                  ?correct=${(this.item.ascore + this.item.hscore) < this.item.combined_score + 0.5}
                  .deadline=${this.item.deadline}
                  .made=${this.item.submit_time}
                  ?result=${this.item.ascore !== null && this.item.hscore !== null}></user-pick>
            `:html`<div></div>`)}
            <div class="label">Under</div>
          </div>  
          <div class="score oscore">${this.item.oscore}</div>
          <div class="actual label">Actual Result</div>
          <div class="score total">${this.item.ascore + this.item.hscore}</div>
          <div class="overp ${classMap({ editable: canPick })}" @click=${this._pickOver}>
            ${cache(this.item.over_selected === 1 ? html`
              <user-pick
                  ?admin=${this.item.admin_made === 1}
                  ?correct=${(this.item.ascore + this.item.hscore) > this.item.combined_score + 0.5}
                  .deadline=${this.item.match_time - (global.lcid === global.cid ? global.lgap : 0)}
                  .made=${this.item.submit_time}
                  ?result=${this.item.ascore !== null && this.item.hscore !== null}></user-pick>
            `: html`<div class="fill"></div>`)}
            <div class="label">Over</div> 
          </div>       
        `:'')}

    `;
  }
  _canPick() {
    return this.item.uid === global.user.uid && this.item.deadline > Math.floor(new Date().getTime() / 1000);
  }
  _commentReply(e) {
    e.stopPropagation();
    if (this._canPick()) {
      this._dispatchPick({
        pid: this.item.pid,
        over_selected: this.item.over_selected,
        comment: e.comment
      });
      this.item.userComment = e.comment;
      this.requestUpdate();
    }
  }
  _dispatchPick(p) {
    const pickData = p;
    pickData.rid = this.item.rid;
    pickData.aid = this.item.aid;
    this.dispatchEvent(new MatchPick(pickData));
  }
  _pickAid(e) {
    e.stopPropagation();
    if (this._canPick()) {
      this._dispatchPick({
        pid: this.item.aid,
        over_selected: this.item.over_selected,
        comment: this.item.userComment
      });
      this.item.pid = this.item.aid;
      this.requestUpdate();
    }
  }
  _pickHid(e) {
    e.stopPropagation();
    if (this._canPick()) {
      this._dispatchPick({
        pid: this.item.hid,
        over_selected: this.item.over_selected,
        comment: this.item.userComment
      });
      this.item.pid = this.item.hid;
      this.requestUpdate();
    }
  }
  _pickOver(e) {
    e.stopPropagation();
    if (this._canPick()) {
      this._dispatchPick({
        pid: this.item.pid,
        over_selected: 1,
        comment: this.item.userComment
      });
      this.item.over_selected = 1;
      this.requestUpdate();
    }
  }
  _pickUnder(e) {
    e.stopPropagation();
    if (this._canPick()) {
      this._dispatchPick({
        pid: this.item.pid,
        over_selected: 0,
        comment: this.item.usercomment
      });
      this.item.over_selected = 0;
      this.requestUpdate();
    }
  }

}
customElements.define('rounds-user-item', RoundsUserItem);