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

import style from '../styles/fw-user-summary.js';

/*
     <fw-user-summary>
*/
class FwUserSummary extends LitElement {
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
      <div class="un">${this.item.name}</div>
      <div class="rs">${this.item.rscore}</div>
      <div class="ps">${this.item.pscore}</div>
      <div class="ts">${this.item.tscore}</div>
    `;
  }
}
customElements.define('fw-user-summary', FwUserSummary);