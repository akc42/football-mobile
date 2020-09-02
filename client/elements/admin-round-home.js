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
import './material-icon.js'
import './fm-input.js';
import page from '../styles/page.js';
import { RoundCreate, DeleteRequest, RoundDelete } from '../modules/events.js';
import global from '../modules/globals.js';
import {switchPath} from '../modules/utils.js';

/*
     <admin-round-home>: Allows Editing of Round Details
*/
class AdminRoundHome extends LitElement {
  static get styles() {
    return [page, css``];
  }
  static get properties() {
    return {
      rounds: {type: Array},
      rid: {type: Number}, //rid of new round whilst being created
      name: {type: String} //potential name of new round.
    };
  }
  constructor() {
    super();
    this.rounds = [];
    this.rid = 1;
    this.name = '';
    this._checkRid = this._checkRid.bind(this);
    this._deleteReply = this._deleteReply.bind(this);
    this.deleterid = null;
  }
  connectedCallback() {
    super.connectedCallback();
    this.deleterid = null;
    this.addEventListener('delete-reply', this._deleteReply);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('delete-reply', this._deleteReply);
  }
  update(changed) {
    if (changed.has('rid')) {
      this.name = `Round Week ${this.rid}`;
    }
    super.update(changed);
  }
  firstUpdated() {
    this.input = this.shadowRoot.querySelector('#newround');
    this.rinput = this.shadowRoot.querySelector('#newrid');
  }
  updated(changed) {
    if (changed.has('rounds')) {
      if (this.rounds.length > 0) {
        this.rid = this.rounds.reduce((ac, cur) => {
          return Math.max(ac, cur.rid);
        },0);
        this.rid++;  //one more than the max
      } else {
        this.rid = 1;
      }
    }
    super.updated(changed);
  }
  render() {
    return html`
      <style>
        .container {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: flex-end;
        }
        .container material-icon {
          cursor: pointer;
          --icon-size: 30px;
          padding-bottom: 7px;
        }
        .add {
          color: var(--create-item-color); 
        }
        #newrid {
          --input-width: 40px;
        }
        #newround {
          --input-width: var(--admin-name-length);
        }
        .name {
          flex: 0 0 var(--admin-name-length);
          padding-bottom: 7px;
          cursor: pointer;
        }
        .no {
          flex: 0 0 40px;
          padding-bottom: 7px;
          cursor:pointer;
        }
        .round {
          border-bottom: 1px dotted var(--accent-color);
          margin-bottom: 1px;
        }
        hr {
          width: 100%;
        }
      </style>
      <football-page id="page" heading="Round Selection">
        
          <div class="container">
            <fm-input
              id="newrid"
              label="No"
              message="Unique"
              type="number"
              required
              step="1"
              min="1"
              .value=${this.rid}
              @value-changed=${this._updateRid}
              .validator=${this._checkRid}></fm-input>
            <fm-input 
              id="newround" 
              label="New Round" 
              required 
              message="Round must have a name" 
              .value=${this.name}
              @value-changed=${this._updateName}></fm-input>
            <material-icon class="add" @click=${this._newRound}>note_add</material-icon> 
          </div>
          <hr/>
          <section class="scrollable">
          ${cache(this.rounds.map(round => html`
            <div class="container round">
              <div class="no" @click=${this._loadRound} data-rid="${round.rid}">${round.rid}</div>
              <div class="name" @click=${this._loadRound} data-rid="${round.rid}">${round.name}</div>
              <material-icon class="del" @click=${this._maybeDelete} data-rid="${round.rid}">close</material-icon>
            </div>    
          `))}
          </section>
      </football-page>
    `;
  }
  _checkRid() {
    if (this.rinput === undefined) return true;
    const v = parseInt(this.rinput.input.value,10);
    if (!Number.isInteger(v)) return false;
    return this.rounds.every(r => r.rid !== v);
  }
  
  _deleteReply(e) {
    e.stopPropagation();
    //just recieving this means go ahead
    if (this.deleterid) {
      this.dispatchEvent(new RoundDelete(this.deleterid));
      this.deleterid = null;
    }
  }
  _loadRound(e) {
    e.stopPropagation();
    const rid = e.currentTarget.dataset.rid; //can leave as string
    switchPath(`${global.cid}/admin/rounds/round/${rid}`);
  }

  _maybeDelete(e) {
    e.stopPropagation();
    const rid = parseInt(e.currentTarget.dataset.rid,10);
    const round= this.rounds.find(r => r.rid === rid);
    const named = `the Round named "${round.name}" (Round ${rid})`
    this.deleterid = rid;
    this.dispatchEvent(new DeleteRequest(named));
  }

  _newRound(e) {
    e.stopPropagation();
    if (this.input !== undefined) {
      this.dispatchEvent(new RoundCreate({rid: this.rid,name: this.name}));
      this.name = ''; //clear name down so we will calculate a new value
      this.rid++; //just assuming I will get this correct in advance;
    }
  }
  
  _updateName(e) {
    e.stopPropagation();
    this.name = e.currentTarget.value;
  }
  _updateRid(e) {
    e.stopPropagation();
    this.rid = parseInt(e.currentTarget.value,10);
  }
}
customElements.define('admin-round-home', AdminRoundHome);