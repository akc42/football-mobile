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
import {classMap} from '../libs/class-map.js';

import style from '../styles/fm-user-summary.js';

import global from '../modules/globals.js';

/*
     <fw-user-summary>
*/
class FmUserSummary extends LitElement {
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
      <div class="un ${classMap({me: global.user.uid === this.item.uid})}">${this.item.name}</div>
      <div class="rs ${classMap({ me: global.user.uid === this.item.uid })}">${this.item.rscore}</div>
      <div class="ps ${classMap({ me: global.user.uid === this.item.uid })}">${this.item.pscore}</div>
      <div class="ts ${classMap({ me: global.user.uid === this.item.uid })}">${this.item.tscore}</div>
    `;
  }
}
customElements.define('fm-user-summary', FmUserSummary);