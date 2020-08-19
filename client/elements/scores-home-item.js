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


import global from '../modules/globals.js';
import { UserSelected } from '../modules/events.js';

/*
     <scores-item>
*/
class ScoresHomeItem extends LitElement {
  static get styles() {
    return css`
  
  :host {
    display: grid;
    grid-gap:2px;
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-areas:
      "user rs ps"
      "user ts ts";
  }
  .un,.rs,.ps,.ts {
    padding:2px;
    background-color: var(--background-color);
    text-align: center;
    vertical-align: center;
    cursor:pointer;
  }
  .un {
    grid-area:user
  }

  .rs {
    grid-area:rs;
  }
  .ps {
    grid-area: ps;
  }
  .ts {
    grid-area:ts;
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
      ${global.user.uid === this.item.uid ? html`
        <style>
          :host {
            background-color: var(--accent-color); 
            border: 2px solid var(--accent-color);
          }
        </style>
      `: html`
        <style>
          :host {
            background-color: var(--secondary-color); 
            border: 2px solid var(--secondary-color);
          }
        </style>
      `}

      <div class="un" @click=${this._select}>${this.item.name}</div>
      <div class="rs" @click=${this._select}>${this.item.rscore}</div>
      <div class="ps" @click=${this._select}>${this.item.lscore}</div>
      <div class="ts" @click=${this._select}>${this.item.tscore}</div>
    `;
  }
  _select(e) {
    e.stopPropagation();
    this.dispatchEvent(new UserSelected(this.item.uid));
  }
}
customElements.define('scores-home-item', ScoresHomeItem);