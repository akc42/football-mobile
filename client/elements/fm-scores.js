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
import {cache} from '../libs/cache.js';

/*
     <fm-scores>
*/
class FmScores extends PageManager {
  static get styles() {
    return [];
  }
  static get properties() {
    return {
    
    };
  }
  constructor() {
    super();
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
    ${cache({
        home: html`<fm-summary managed-page></fm-summary>`,
        round: html`<fm-round managed-page></fm-round>`,
        teams: html`<fm-teams managed-page></fm-teams>`
    })}
    `;
  }
}
customElements.define('fm-scores', FmScores);