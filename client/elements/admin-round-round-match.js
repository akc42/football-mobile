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

/*
     <admin-round--round-match>: Allows setup and subsequent editing of matches in a round.
*/
class AdminRoundRoundMatch extends LitElement {
  static get styles() {
    return [page, css``];
  }
  static get properties() {
    return {
      round: {type: Object},
      teams: {type: Array},
      matches: {type:Array},
      unmatched: {type: Array}, //teams not yet in a competition
      confs: {type: Array},
      divs: {type:Array}
    };
  }
  constructor() {
    super();
    this.matches = [];
    this.unmatched = [];
    this.teams = [];
    this.confs = [];
    this.divs = [];
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
      <football-page id="page" heading="Match Management">
        <div slot="heading">${this.round.name}</div>
        <p>STILL TO BE IMPLEMENTED</p>
      </football-page>
    `;
  }
}
customElements.define('admin-round-round-match', AdminRoundRoundMatch);