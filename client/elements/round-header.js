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

import './material-icon.js';
import {RoundChanged} from '../modules/events.js';

/*
     <round-header>
*/
class RoundHeader extends LitElement {
  static get styles() {
    return css``;
  }
  static get properties() {
    return {
      round: {type: Object},
      next: {type: Number}, //Next rid (unless 0 when none)
      previous: {type: Number} //previous rid (unless 0 when none)
    };
  }
  constructor() {
    super();
    this.round = {rid:0}
    this.next = 0;
    this.previous = 0;
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    super.update(changed);
  }
  firstUpdated() {
    this.roundName = this.shadowRoot.querySelector('#rn')
    this.roundNo = this.shadowRoot.querySelector('#rr');
  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`
      <style>
        header {
          border:2px solid var(--accent-color);
          border-radius: 5px;
          box-shadow: 1px 1px 3px 0px var(--shadow-color);
          padding: 1px;
          margin:3px;
          display: flex;
          flex-direction: row;
          justify-content: space-between;  
          align-items: center;           
        }
        .pt {
          cursor: pointer;
        }
        .icons {
          color: var(--item-present);
        }
        .rr,.rn {
          font-weight: bold;
        }
      </style>
      <header @click=${this._supress}>
        ${this.previous === 0 ? html`<div>&nbsp;</div>`: html`<material-icon class="pt" @click=${this._goPrevious}>arrow_back</material-icon>`}
        <div id="rr" class="rr pt">Round ${this.round.rid}</div>
        <div id="rn" class="rn pt">${this.round.name}</div>
        ${this.round.ou_round === 1 || this.round.valid_question === 1 ? html`
          <div class="icons">${this.round.ou_round ?
            html`<material-icon>thumbs_up_down</material-icon>` : ''}
            ${this.round.valid_question ? html`<material-icon>question_answer</material-icon>` : ''}
          </div>
        `: ''}
        ${this.next === 0 ? html`<div @click=${this._surpress}>&nbsp;</div>`:html`<material-icon class="pt" @click=${this._goNext} >arrow_forward</material-icon>`}
      </header>
    `;
  }
  _goNext(e) {
    e.stopPropagation();
    this.dispatchEvent(new RoundChanged({rid: this.next}));
  }
  _goPrevious(e) {
    e.stopPropagation();
    this.dispatchEvent(new RoundChanged({rid: this.previous}));
  }
  _supress(e) {
    if (e.target !== this.roundName && e.target !== this.roundNo) e.stopPropagation();
    
  }
}
customElements.define('round-header', RoundHeader);