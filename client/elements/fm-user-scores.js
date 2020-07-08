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

import './app-page.js';
import page from '../styles/page.js';

/*
     <fm-user-scores>
*/
class FmUserScores extends LitElement {
  static get styles() {
    return [page];
  }
  static get properties() {
    return {
      user: {type: Object}
    };
  }
  constructor() {
    super();
    this.user = {uid:0,name:''}
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
        <app-page id="page" heading="User Scores">
        <p>Not implemented Yet</p>
        </app-page>
    `;
  }
}
customElements.define('fm-user-scores', FmUserScores);