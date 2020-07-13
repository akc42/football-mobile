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

import { RoundSelected } from '../modules/events.js';

import style from '../styles/fm-user-round.js';

/*
     <fw-user-score>
*/
class FmUserScore extends LitElement {
  static get styles() {
    return [style];
  }
  static get properties() {
    return {
      item: {type: Object}
    };
  }
  constructor() {
    super();
    this.item = {name:'',rscore:'',pscore:'',tscore:''};
  }

  render() {
    return html`
      <div class="rn" @click=${this._select}>${this.item.rname}</div>
      <div class="mp" @click=${this._select}>${this.item.pscore}</div>
      <div class="ou" @click=${this._select}>${this.item.oscore}</div>
      <div class="mt" @click=${this._select}>${this.item.mscore}</div>
      <div class="bs" @click=${this._select}>${this.item.bscore}</div>
      <div class="rs" @click=${this._select}>${this.item.rscore}</div>
    `;
  }
  _select(e) {
    e.stopPropagation();
    this.dispatchEvent(new RoundSelected(this.item.rid));
  }
}
customElements.define('fm-user-score', FmUserScore);