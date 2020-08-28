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
import button from '../styles/button.js';
import {CompetitionChanged} from '../modules/events.js';
import './fm-input.js';
import './calendar-input.js';
import { switchPath } from '../modules/utils.js';
import global from '../modules/globals.js';


/*
     <gadm-manager>: Main Page for all the global admin functions
*/
class AdminHome extends LitElement {
  static get styles() {
    return [page, button, css``];
  }
  static get properties() {
    return {
      competition: {type: Object}
    };
  }
  constructor() {
    super();
    this.competition = {cid: 0, name: '', expected_date: 0, gap: 0, pp_deadline: 0, condition: ''}
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
          --input-width: 98%;
        }
        fm-input#gap {
          --input-width: 50px;
        }
        .timeline {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
        .step {
          padding: 5px;
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
          <div class="timeline">
            <div class="deadline">
              <label for="pp_deadline">Playoff Picks Deadline</label>
              <calendar-input 
                id="pp_deadline" 
                name="ppdead" 
                .value=${this.competition.pp_deadline} 
                @value-changed=${this._newPPDeadline} 
                withTime></calendar-input>
            </div>
            <div class="step">
              ${cache(this.competition.team_lock === 0 ? html`<button @click=${this._teams}>Teams</button>` :
                this.competition.open === 0 ? html`<button @click=${this._open}>Open Registration</button>` :
                this.competition.closed ? html`<button @click=${this._close}>Close Registrations</button>` : '')}
            </div>
          </div>
          <fm-input 
            id="gap" 
            label="Deadline (in Seconds) before Match Time for Match Picks" 
            message="Must be between 0 and 600 seconds"
            .value=${this.competition.gap.toString()} 
            type="Number"
            required
            min="0"
            step="1"
            max="600"
            @blur=${this._newGap}></fm-input>

        </div>
        <button slot="action" @click=${this._rounds}>Rounds</button>
        <button slot="action" @click=${this._maps}>Slider Maps</button>
        <button slot="action" @click=${this._email}>Email Users</button>    
      </fm-page>
    `;
  }
  _close(e) {
    e.stopPropagation();
    if (this.competition.closed === 0) {
      this.competition.closed = 1;
      this.dispatchEvent(new CompetitionChanged({ cid: this.competition.cid, closed: this.competition.closed }));
    }
  }
  _conditionChange(e) {
    e.stopPropagation();
    if (this.competition.condition !== e.currentTarget.value) {
      this.competition.condition = e.currentTarget.value;
      this.dispatchEvent(new CompetitionChanged({cid: this.competition.cid, condition: this.competition.condition}));
    }
  }
  _email(e) {
    e.stopPropagation();
    switchPath(`${global.cid}/admin/email`);
  }
  _maps(e) {
    e.stopPropagation();
    switchPath(`${global.cid}/admin/map`);
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
  _newGap(e) {
    if (e.currentTarget.validate()) {
      const gap = parseInt(e.currentTarget.value, 10);
      if (gap !== this.competition.gap) {
        this.competition.gap = gap;
        this.dispatchEvent(new CompetitionChanged({ cid: this.competition.cid, gap: this.competition.gap }));
      }
    }

  }
  _newPPDeadline(e) {
    e.stopPropagation();
    if (this.competition.pp_deadline !== e.changed) {
      this.competition.pp_deadline = e.changed;
      this.dispatchEvent(new CompetitionChanged({ cid: this.competition.cid, pp_deadline: this.competition.pp_deadline }));
    }
  }
  _open(e) {
    e.stopPropagation();
    if (this.competition.open === 0) {
      this.competition.open = 1;
      this.dispatchEvent(new CompetitionChanged({cid: this.competition.cid, open: this.competition.open}));
    }
  }
  _rounds(e) {
    e.stopPropagation();
    switchPath(`${global.cid}/admin/round`);
  }
  _teams(e) {
    e.stopPropagation();
    switchPath(`${global.cid}/admin/teams`);
  }
}
customElements.define('admin-home', AdminHome);