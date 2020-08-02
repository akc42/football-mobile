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
import {classMap} from '../libs/class-map.js';
import {cache} from '../libs/cache.js';


import global from '../modules/globals.js';
import { UserSelected } from '../modules/events.js';

import './material-icon.js';
import './user-pick.js';

/*
     <fw-round-user>
*/
class FmRoundUser extends LitElement {
  static get styles() {
    return css`
  :host {

    background-color: var(--app-primary-color);
    display: grid;
    grid-gap:2px;
    grid-template-columns: 2fr repeat(4,1fr);
    grid-template-areas:
      "un mr ou bn tl"
      "un pk pk op done";
  }
  .un, .mr, .ou, .bn, .tl, .pk, .op, .done {
    padding:2px;
    background-color: white;
    color:var(--app-primary-text);
    text-align: center;
    vertical-align: center;
    cursor:pointer;
  }
  .un {
    grid-area:un;
  }

  .mr {
    grid-area:mr;
  }
  .ou {
    grid-area: ou;
  }
  .tl {
    grid-area:tl;
  }
  .pk {
    grid-area: pk;
  }
  .op {
    grid-area: op;
  }
  .done {
    grid-area: done;
    color: green;
  }
  .me {
    background-color: var(--app-user-color);
    color: var(--app-user-text);
    font-weight: bold; 
  }
  .late {
    font-size: 8pt;
    font-weight: normal;
  }
  .support {
    color: red;
    font-weight: normal;
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
    this.item = {uid:0, name:'',rscore:'',lscore:'',tscore:''};
  }

  render() {
    return html`
      <div class="un ${classMap({me: global.user.uid === this.item.uid})}" @click=${this._select}>${this.item.name}</div>
      <div class="mr ${classMap({ me: global.user.uid === this.item.uid })}" @click=${this._select}>${this.item.pscore}</div>
      <div 
        class="ou ${classMap({ me: global.user.uid === this.item.uid })}" 
        @click=${this._select}>${this.item.ouRound ? this.item.oscore : ''}</div>
      <div 
        class="bn ${classMap({ me: global.user.uid === this.item.uid })}" 
        @click=${this._select}>${this.item.validQuestion ?this.item.bscore: ''}</div>
      <div class="tl ${classMap({ me: global.user.uid === this.item.uid })}" @click=${this._select}>${this.item.score}</div>
      <div class="pk ${classMap({ me: global.user.uid === this.item.uid })}" @click=${this._select}>
        ${cache(this.item.canPick?html`
          <material-icon>alarm</material-icon>
        `:html`
          ${this.item.wasLate ? html`<div class="late">L</div>` : (this.item.hadAdminSupport ? html`<div class="support">A</div>` : '')}

        `)}
      </div>
      <div class="op ${classMap({ me: global.user.uid === this.item.uid })}" @click=${this._select}>
      ${cache(this.item.validQuestion ? html`
        ${cache(this.item.canOption ? html`
          <material-icon>alarm</material-icon>
        `: html`
          ${this.item.submit_time > this.item.deadline ? html`<div class="late">L</div>` : (this.item.admin_made === 1 ? html`<div class="support">A</div>` : '')} 
        `)}
      `:'')}
      </div>
      <div class="done ${classMap({ me: global.user.uid === this.item.uid })}" @click=${this._select}>
        ${cache(this.item.doneAllPicks?html`<material-icon>check</material-icon>`:'')}
      </div>
    `;
  }
  _select(e) {
    e.stopPropagation();
    this.dispatchEvent(new UserSelected(this.item.uid));
  }
}
customElements.define('fm-round-user', FmRoundUser);