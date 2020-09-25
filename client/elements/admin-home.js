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
import emoji from '../styles/emoji.js';
import {CompetitionChanged, TeamsSet} from '../modules/events.js';
import './fm-input.js';
import './fm-checkbox.js';
import './calendar-input.js';
import { switchPath } from '../modules/utils.js';
import global from '../modules/globals.js';

/*
     <gadm-manager>: Main Page for all the global admin functions
*/
class AdminHome extends LitElement {
  static get styles() {
    return [page, button,emoji, css``];
  }
  static get properties() {
    return {
      competition: {type: Object},
      rid: {type: Number}, //largest round in competition (or 0 if none)
      maxtic: {type: Number}  //maximum cid for teams in competition
    };
  }
  constructor() {
    super();
    this.competition = {cid: 0, name: '', expected_date: 0, gap: 0, pp_deadline: 0, condition: ''}
  }

  render() {
    return html`
      <style>
      .container {
        width: 100%;
        overflow-x: hidden;
      }
        fm-input#compname {
          --input-width: var(--admin-name-length);
        }
        fm-input#gap, fm-input#dbonus, fm-input#dpick, fm-input#dplayoff, fm-input#dunder {
          --input-width: var(--points-input-width);
        }
        #condition {
          --input-width: var(--text-input-width);
          width: var(--text-input-width);
        }

        .step {
          display:flex;
          flex-direction: column;
        }
   
      </style>
      <fm-page id="page" heading="Competition Setup">
        <div class="container">
          <fm-input id="compname" label="Competition Name" .value=${this.competition.name} required @blur=${this._nameChange}></fm-input>
          ${cache(this.competition.open ? '':html`
            <label for="opendate">Expected Opening Date</label>
            <calendar-input id="opendatate" name="opendate" .value=${this.competition.expected_date} @value-changed=${this._newExpected}></calendar-input>
          `)}
          ${cache(this.competition.closed ? html`
            <label for="condition">Registration Condition</label>
            <div id="condition" class="panel">${this.competition.condition}</div>
          `:html`
            <fm-input id="condition" label="Registration Condition" textarea .value=${this.competition.condition} @blur=${this._conditionChange} rows="5"></fm-input>
          `)}

          <calendar-input 
            id="pp_deadline" 
            name="ppdead" 
            label="Playoff Picks Deadline"
            .value=${this.competition.pp_deadline} 
            @value-changed=${this._newPPDeadline} 
            withTime></calendar-input>
          <fm-input
            id="dplayoff"
            name="dplayoff"
            label="Default Playoff Points (Set before selecting teams)"
            message="Between 1 and 8"
            type="number"
            required
            min="1"
            step="1"
            max="8"
            .value=${this.competition.default_playoff.toString()}
            @blur=${this._newDPlayoff}></fm-input>                       
          <fm-input
            id="gap"
            name="gap"
            label="Deadline (in Minutes) before Match Time for Match Picks"
            message="Must be between 0 and 10 minutes"
            .value=${this.competition.gap.toString()} 
            type="Number"
            required
            min="0"
            step="1"
            max="10"
            @blur=${this._newGap}></fm-input>
          <fm-input
            id="dpick"
            name="dpick"
            label="Default Match Pick Points"
            message="Between 1 and 8"
            type="number"
            required
            min="1"
            step="1"
            max="8"
            .value=${this.competition.default_points.toString()}
            @blur=${this._newDPick}></fm-input>              
          <fm-input
            id="dbonus"
            name="dbonus"
            label="Default Bonus Points"
            message="Between 1 and 8"
            type="number"
            required
            min="1"
            step="1"
            max="8"
            .value=${this.competition.default_bonus.toString()}
            @blur=${this._newDBonus}></fm-input>
      
          <div class="step">
            <fm-checkbox
              name="team_lock"
              .value=${this.competition.team_lock} 
              @value-changed=${this._teamLock}
              ?disabled=${this.competition.open === 1 || this.maxtic < this.competition.cid}>Teams Fixed</fm-checkbox>
            <fm-checkbox 
              name="open"
              .value=${this.competition.open} 
              @value-changed=${this._competitionOpen}
              ?disabled=${this.competition.team_lock === 0 || this.competition.closed === 1}>Registration Open</fm-checkbox>
            <fm-checkbox
              name="closed" 
              .value=${this.competition.closed} 
              @value-changed=${this._competitionClose}
              ?disabled=${this.competition.open === 0}>Registration Closed</fm-checkbox>
          </div>


        </div>
        ${cache(this.competition.team_lock === 1 ? html`<button slot="action" @click=${this._rounds}><material-icon>rotate_90_degrees_ccw</material-icon> Rounds</button>`: '')}
        <button slot="action" @click=${this._teams}><material-icon outlined>group_work</material-icon> Teams</button>
        <button slot="action" @click=${this._email}><material-icon>email</material-icon> Email Users</button>    
      </fm-page>
    `;
  }

  _competitionClose(e) {
    this.competition.closed = e.changed ? 1 : 0;
    this.dispatchEvent(new CompetitionChanged({ cid: this.competition.cid, closed: this.competition.closed }));
    this.requestUpdate();
  }
  _competitionOpen(e) {
    this.competition.open = e.changed ? 1 : 0;
    this.dispatchEvent(new CompetitionChanged({ cid: this.competition.cid, open: this.competition.open }));
    this.requestUpdate();
  }
  _conditionChange(e) {
    e.stopPropagation();
    if (this.competition.condition !== e.currentTarget.value) {
      this.competition.condition = e.currentTarget.value;
      this.dispatchEvent(new CompetitionChanged({ cid: this.competition.cid, condition: this.competition.condition }));
      this.requestUpdate();
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
        this.dispatchEvent(new CompetitionChanged({ cid: this.competition.cid, name: this.competition.name }));
        this.requestUpdate();
      }
    }
  }
  _newDBonus(e) {
    if (e.currentTarget.validate()) {
      const bonus = parseInt(e.currentTarget.value, 10);
      if (bonus !== this.competition.default_bonus) {
        this.competition.default_bonus = bonus;
        this.dispatchEvent(new CompetitionChanged({ cid: this.competition.cid, default_bonus: bonus }));
        this.requestUpdate();
      }
    }
  }
  _newDPick(e) {
    if (e.currentTarget.validate()) {
      const points = parseInt(e.currentTarget.value, 10);
      if (points !== this.competition.default_points) {
        this.competition.default_points = points;
        this.dispatchEvent(new CompetitionChanged({ cid: this.competition.cid, default_points: points }));
        this.requestUpdate();
      }
    }
  }
  _newDPlayoff(e) {
    if (e.currentTarget.validate()) {
      const poff = parseInt(e.currentTarget.value, 10);
      if (poff !== this.competition.default_playoff) {
        this.competition.default_playoff = poff;
        this.dispatchEvent(new CompetitionChanged({ cid: this.competition.cid, default_playoff: poff }));
        this.requestUpdate();
      }
    }
  }

  _newExpected(e) {
    e.stopPropagation();
    if (this.competition.expected_date !== e.changed) {
      this.competition.expected_date = e.changed;
      this.dispatchEvent(new CompetitionChanged({ cid: this.competition.cid, expected_date: this.competition.expected_date }));
      this.requestUpdate();
    }
  }
  _newGap(e) {
    if (e.currentTarget.validate()) {
      const gap = parseInt(e.currentTarget.value, 10);
      if (gap !== this.competition.gap) {
        this.competition.gap = gap;
        this.dispatchEvent(new CompetitionChanged({ cid: this.competition.cid, gap: gap }));
        this.requestUpdate();
      }
    }

  }
  _newPPDeadline(e) {
    e.stopPropagation();
    if (this.competition.pp_deadline !== e.changed) {
      this.competition.pp_deadline = e.changed;
      this.dispatchEvent(new CompetitionChanged({ cid: this.competition.cid, pp_deadline: this.competition.pp_deadline }));
      this.requestUpdate();
    }
  }
  _rounds(e) {
    e.stopPropagation();
    let path = `${global.cid}/admin/rounds`;
    if (this.rid > 0) path += `/round/${this.rid}`
    switchPath(path);
  }
  _teamLock(e) {
    this.competition.team_lock = e.changed ? 1 : 0;
    this.dispatchEvent(new CompetitionChanged({ cid: this.competition.cid, team_lock: this.competition.team_lock }));
    this.requestUpdate();
  }

  _teams(e) {
    e.stopPropagation();
    if (this.maxtic < this.competition.cid) this.dispatchEvent(new TeamsSet()); //Tells the manager to get set up teams in competition now
    switchPath(`${global.cid}/admin/teams`);
  }
}
customElements.define('admin-home', AdminHome);