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

import style from '../styles/fm-user-match.js';

/*
     <fw-user-score>
*/
class FmUserMatch extends LitElement {
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
      <style>
        :host {
          display:grid;
          grid-gap: 2px;
        }
      
      </style>
        <img class="aid-logo" src="/appimage/teams/${this.item.aid}.png"/>
        <div class="name">${this.item.aid}</div>
        <div class="result"> </div>
        <img class="hid-logo" src="/appimage/teams/${this.item.hid}.png"/>
      <div class="team hid">
      </div>
    `;
  }
  _select(e) {
    e.stopPropagation();
    this.dispatchEvent(new RoundSelected(this.item.rid));
  }
}
customElements.define('fm-user-match', FmUserMatch);