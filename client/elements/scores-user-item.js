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

import { RoundSelected } from '../modules/events.js';


/*
     <scores-user-item>
*/
class ScoresUserItem extends LitElement {
  static get styles() {
    return css`
      :host {

        background-color: var(--app-primary-color);
        display: grid;
        grid-gap:2px;
        grid-template-columns: 3fr 2fr 1fr;
        grid-template-areas:
          "round mp mt"
          "round ou mt"
          "round bs rs";
      }
      .rn,.mp,.ou, .mt,.bs,.rs {
        padding:2px;
        background-color: white;
        color:var(--app-primary-text);
        text-align: center;
        vertical-align: center;
        cursor:pointer;
      }
      .rn {
        grid-area:round;
      }

      .mp {
        grid-area:mp;
      }
      .ou {
        grid-area: ou;
      }
      .mt {
        grid-area:mt;
      }
      .bs {
        grid-area: bs;
      }
      .rs {
        grid-area: rs;
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
    this.item = {name:'',score:'',pscore:'',oscore:'', mscore:'', bscore:''};
  }

  render() {
    return html`
      <div class="rn" @click=${this._select}>${this.item.name}</div>
      <div class="mp" @click=${this._select}>${this.item.pscore}</div>
      <div class="ou" @click=${this._select}>${this.item.oscore}</div>
      <div class="mt" @click=${this._select}>${this.item.mscore}</div>
      <div class="bs" @click=${this._select}>${this.item.bscore}</div>
      <div class="rs" @click=${this._select}>${this.item.score}</div>
    `;
  }
  _select(e) {
    e.stopPropagation();
    this.dispatchEvent(new RoundSelected(this.item.rid));
  }
}
customElements.define('scores-user-item', ScoresUserItem);