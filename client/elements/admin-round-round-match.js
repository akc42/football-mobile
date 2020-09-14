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

import './football-page.js';
import './admin-match.js';
import './match-conf-div.js';
import './dialog-box.js';
import './fm-input.js';
import './material-icon.js';

import page from '../styles/page.js';
import { InputReply, MatchCreate, MatchChanged, TeamDeselected, MatchSwap, MatchDelete } from '../modules/events.js';


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
      divs: {type:Array},
      label: {type:String}, //label for input in dialog box (dynamically set)
      value: {type: String}, //value for dialog input
      next: { type: Number }, //Next rid (unless 0 when none)
      previous: { type: Number } //previous rid (unless 0 when none)

    };
  }
  constructor() {
    super();
    this.matches = [];
    this.unmatched = [];
    this.teams = [];
    this.confs = [];
    this.divs = [];
    this.round = {rid: 0};
    this.label = '';
    this.value = '';
    this.original = '';
    this.dialogInUse = true;
    this.next = 0;
    this.previous = 0
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    if (changed.has('matches')) {
      this.unmatched = this.teams.filter(t => !(t.eliminated === 1 || this.matches.some(m => m.aid === t.tid || m.hid === t.tid)));
    }
    super.update(changed);
  }
  firstUpdated() {
    this.dialog = this.shadowRoot.querySelector('#diag');
    this.input = this.shadowRoot.querySelector('#input');
    this.dialogInUse = false;
  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`
      <style>
        .matches {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
        }
        .teams {
          display: flex;
          flex-direction: column;
        }
        hr {
          width: 100%;
        }
        dialog-box {
          --dialog-color: var(--background-color);
        }
        #input {
          --input-width: 35px;
          margin: 20px;
        }
        .icons {
          color: var(--item-present);
          --icon-size: 16px;
        }
      </style>
      <dialog-box id="diag" position="target" @overlay-closed=${this._dialogClosed} @overlay-closing=${this._dialogClosing}>
        <fm-input
          id="input"
          label=${this.label}
          message="Number Required"
          type="number"
          step="1"
          min="1"
          .value=${this.value}
          @value-changed=${this._valueChanged}></fm-input>
      </dialog-box>
      <football-page id="page" heading="Match Management">
        <div slot="heading">${this.round.name}</div>
        ${this.round.ou_round === 1 || this.round.valid_question === 1 ? html`
          <div slot="heading" class="icons">${this.round.ou_round ?
            html`<material-icon>thumbs_up_down</material-icon>` : ''}${this.round.valid_question ?
            html`<material-icon>question_answer</material-icon>` : ''}</div>
        `: ''}
        <section class="scrollable">
          <section class="matches">
            ${cache(this.matches.map(match => html`
              <admin-match
                id="M${match.aid}"
                .round=${this.round}
                .match=${match}
                @team-deselected=${this._teamDeselected}
                @input-request=${this._inputRequest}></admin-match>
            `))}
          </section>
          <hr/>
          <section class="teams">
          ${cache(this.confs.map(conf => this.divs.map(div =>
          html`
            <match-conf-div id="${conf.confid+div.divid}" .conf=${conf} .div=${div} .teams=${this.unmatched} @team-selected=${this._teamSelected}></match-conf-div>
          `)))}
          </section>

        </section>
      </football-page>
    `;
  }
  _dialogClosed(e) {
    e.stopPropagation();
    const value = this.value === ''? null:parseInt(this.value,10);
    this.dialog.positionTarget.dispatchEvent(new InputReply({field:this.field, value: value}));
    this.value = '';
    this.dialogInUse = false;
  }
  _dialogClosing(e) {
    e.stopPropagation();
    if (!this.input.validate()) e.preventDefault();
  }
  _inputRequest(e) {
    e.stopPropagation();
    if (!this.dialogInUse) {
      this.dialogInUse = true;
      this.value = e.request.value === null ? '': e.request.value.toString();
      this.original = this.value;
      this.field = e.request.field;
      this.dialog.positionTarget = e.composedPath()[0];
      this.dialog.show();
    }
  }
  _teamDeselected(e) {
    e.stopPropagation();
    const tid = e.tid;
    const match = this.matches.find(m => m.aid === tid || m.hid === tid);
    if (match !== undefined) {
      if (tid === match.hid) {
        this.dispatchEvent(new MatchChanged({rid: this.round.rid, aid: match.aid, hid: null}))
      } else if (match.hid !== null && match.hid.length > 0){
        this.dispatchEvent(new MatchSwap({rid: this.round.rid, aid: tid, drop: true}))
      } else {
        this.dispatchEvent(new MatchDelete({rid: this.round.rid, aid: tid}));
      }
      const team = this.teams.find(t => t.tid === tid);
      if (team !== undefined) {
        this.unmatched.push(team);
        const mcd = this.shadowRoot.querySelector(`#${team.confid + team.divid}`);
        if (mcd !== undefined) mcd.dispatchEvent(new TeamDeselected(tid)); //tell just the correct match-conf-div they have a team back
      }
    }
  }
  _teamSelected(e) {
    e.stopPropagation();
    const tid = e.tid;
    const match = this.matches.find(m => m.aid === tid || m.hid === tid);
    if (match === undefined) {
      const match = this.matches.find(m => m.hid === null);
      if (match === undefined) {
        //we don't have this match so we need to create it
        this.dispatchEvent(new MatchCreate({rid: this.round.rid, aid: tid}));
      } else {
        //its an upgrade
        const idx = this.unmatched.findIndex(t => t.tid === tid);
        if (idx >= 0) this.unmatched.splice(idx,1);  //silently remove from teams (no need to trigger update yet);
        this.dispatchEvent(new MatchChanged({rid: this.round.rid, aid: match.aid, hid: tid}));
      }
    }
  }
  _valueChanged(e) {
    e.stopPropagation();
    this.value = e.changed;
  }
}
customElements.define('admin-round-round-match', AdminRoundRoundMatch);
