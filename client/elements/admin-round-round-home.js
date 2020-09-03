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

import './football-page.js';
import page from '../styles/page.js';
import button from '../styles/button.js';

import {switchPath} from '../modules/utils.js';
import global from '../modules/globals.js';


/*
     <admin-round-round-home>: Allows Selection of Other Rounds
*/
class AdminRoundRoundHome extends LitElement {
  static get styles() {
    return [page, button, css``];
  }
  static get properties() {
    return {
      round: {type: Object}
    };
  }
  constructor() {
    super();
    this.round = {rid: 0, name: ''}
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
  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`
      <style>
      </style>
      <football-page id="page" heading="Round Details">
        <div slot="heading">${this.round.name}</div>
        <section class="scrollable">
          <fm-input 
            id="name" 
            name="name" 
            label="Round Name" 
            required 
            .value=${this.round.name}
            @blur=${this._nameChange}></fm-input>
            
        </section>
        <button slot="action" @click=${this._options}>Bonus Question</button>
        <button slot="action" @click=${this._matches}>Matches</button>
      </football-page>
    `;
  }
  _nameChange(e) {
    
  }
  _matches(e) {
    e.stopPropagation();
    switchPath(`${global.cid}/admin/rounds/round/${this.round.rid}/match`);
  }
  _options(e) {
    e.stopPropagation();
    switchPath(`${global.cid}/admin/rounds/round/${this.round.rid}/bonus`);
  }
}
customElements.define('admin-round-round-home', AdminRoundRoundHome);