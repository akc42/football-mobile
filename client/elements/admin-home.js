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
import {cache} from '../libs/cache.js';

import './fm-page.js';
import page from '../styles/page.js';
import {CompetitionChanged} from '../modules/events.js';
import './fm-input.js';
import './calendar-input.js';


/*
     <gadm-manager>: Main Page for all the global admin functions
*/
class AdminHome extends LitElement {
  static get styles() {
    return [page, css``];
  }
  static get properties() {
    return {
      competition: {type: Object}
    };
  }
  constructor() {
    super();
    this.competition = {cid: 0, name: '', expected_date: 0}
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
        fm-input {
          width: 98%;
        }
      </style>
      <fm-page id="page" heading="Competition Setup">
        <div class="container">
          <fm-input label="Competition Name", .value=${this.competition.name} required @blur=${this._nameChange}></fm-input>
          ${cache(this.competition.open ? '':html`
            <label for="opendate">Expected Opening Date</label>
            <calendar-input id="opendatate" name="opendate" .value=${this.competition.expected_date} @value-changed=${this._newExpected}></calendar-input>
          `)}
          ${cache(this.competition.closed ? html`
            <label for="condition">Registration Condition</label>
            <div id="condition" class="panel">${this.competition.condition}</div>
          `:html`
            <fm-input label="Registration Condition" textarea .value=${this.competition.condition} @blur=${this._conditionChange} rows="5"></fm-input>
          `)}
          <label for="pp_deadline">Playoff Picks Deadline</label>
          <calendar-input id="pp_deadline" name="ppdead" .value=${this.competition.pp_deadline} @value-changed=${this._newPPDeadline} withTime></calendar-input>
          <fm-input 
            id="gap" 
            label="Deadline (in Seconds) before Match Time for Match Picks" 
            message="Must be between 0 and 600 seconds"
            .value=${this.competition.gap} 
            type="Number"
            min="0"
            step="1"
            max="600"
            @blur

        </div>
      </fm-page>
    `;
  }
  _conditionChange(e) {
    e.stopPropagation();
    if (this.competition.condition !== e.currentTarget.value) {
      this.competition.condition = e.currentTarget.value;
      this.dispatchEvent(new CompetitionChanged({cid: this.competition.cid, condition: this.competition.condition}));
    }
  }

  _nameChange(e) {
    e.stopPropagation();
    if (e.currentTarget.validate()) {
      if (e.currentTarget.value !== this.competition.name) {
        this.competition.name = e.currentTarget.value;
        this.dispatchEvent(new CompetitionChanged({cid: this.competition.cid, name: this.competition.name}));
      }
    }
  }
  _newExpected(e) {
    e.stopPropagation();
    if (this.competition.expected_date !== e.changed) {
      this.competition.expected_date = e.changed;
      this.dispatchEvent(new CompetitionChanged({cid: this.competition.cid, expected_date: this.competition.expected_date}));
    }
  }
}
customElements.define('admin-home', AdminHome);