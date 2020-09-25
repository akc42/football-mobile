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
import './material-icon.js';

import { PromoteList } from '../modules/events.js';


/*
     <gadm-home>: basic competition create functions, plus menu to other
*/
class GadmPromote extends LitElement {
  static get styles() {
    return [page, button, css``];
  }
  static get properties() {
    return {
      promotables: {type: Array}, //Can't promote global_admins so this is the list without them (although will contain promoted until until saved)
      users: {type: Array},
      selectedUser: {type: Number}
    };
  }
  constructor() {
    super();
    this.promotables = [];
    this.users = [];
    this.selectedUser = 0;


  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
 
  }
  update(changed) {
    if (changed.has('users')) {
      //we cannot promote global admins any more, nor can we demote them (policy - manually done in database if  mistake)
      //we need to clone the user objects so that there are no references
      this.promotables = JSON.parse(JSON.stringify(this.users.filter(u => u.global_admin === 0))); //we cannot promote global admins any more.
      this.gaPromotes = new Set();
      this.maPromotes = new Set();
      this.maDemotes = new Set();
      this.unPromotes = new Set();
      this.unDemotes = new Set();

    }
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
        :host {
          --icon-size: 20px;
        }
        .row {
          display: flex;
          flex-direction: row;
          align-items: center;
        }

        .name {
          width: 100%;
        }
        .pa, .ga, .ma, .us, .iconreplace {
          width: 20px;
          margin: 0 2px;
        }
        .u {
          cursor: pointer;
          border-bottom: 1px dotted var(--accent-color);
          margin-bottom: 1px;
          scroll-snap-align: start;
        }
      </style>
      <fm-page id="page" heading="Global Admin">
        <div slot="subheading">Promote Users</div>
        
        <header id="explain">
          <p>Users have levels - Promotion moves up a level, Demotion moves down. Global Admin's cannot be demoted once saved.  Temporarily set levels and then save to make permanent.
          <ol>
          <li value="-1"><material-icon>notifications_paused</material-icon> Not to be sent notifications</li>
          <li>&nbsp;&nbsp;&nbsp; Normal Member</li>
          <li><material-icon>grading</material-icon> Can approve new members</li>
          <li><material-icon>public</material-icon> Global Administrator</li>
          </ol> </p>   
          <p><material-icon>font_download</material-icon> Recent Competition Administrator (not a level)</p>      
        </header>
        <section id="userlist" class="scrollable">
          ${cache(this.promotables.map(user => html`
            <div class="row u" data-uid="${user.uid}" @click=${this._toggleSelected}>
              <div class="name">${user.name}</div>
              ${user.previous_admin !== 0 ? html`<material-icon class="pa">font_download</material-icon>` : html`<div class="iconreplace"></div>`}
              ${user.global_admin !== 0 ? html`<material-icon class="ga">public</material-icon>` : html`<div class="iconreplace"></div>`}
              ${user.member_approve !== 0 ? html`<material-icon class="ma">grading</material-icon>` : html`<div class="iconreplace"></div>`}
              ${user.unlikely !== 0 ? html`<material-icon>notifications_paused</material-icon>` : html`<div class="iconreplace"></div>`}
              <material-icon class="us">${user.selected ? 'check_box' : 'check_box_outline_blank'}</material-icon>
            </div>
          `))}
        </section>


        <button slot="action" @click=${this._doPromote}><material-icon>person_add</material-icon> Promote Selected</button>
        <button slot="action" @click=${this._doDemote}><material-icon>person_remove</material-icon> Demote Selected</button>
        <button slot="save" @click=${this._doSave}><material-icon>save</material-icon> Save Changes</button>
        <button cancel slot="save" @click=${this._doClear}><material-icon>people_outline</material-icon> Clear Selections</button>
      </fm-page>
    `;
  }
  _doClear(e) {
    e.stopPropagation();
    for (const user of this.promotables) user.selected = false;
    this.requestUpdate();
  }
  _doDemote(e) {
    e.stopPropagation();
    for(const user of this.promotables) {
      if (user.selected) {
        if (user.global_admin === 1) {
          user.global_admin = 0;
          this.gaPromotes.delete(user.uid)
        } else if (user.member_approve === 1) {
          user.member_approve = 0;
          this.maPromotes.delete(user.uid);
          this.maDemotes.add(user.uid);
        } else if (user.unlikely === 0) {
          user.unlikely = 1;
          //ths following two are deliberately backwards (system promotes, user perception is demote)
          this.unPromotes.add(user.uid);
          this.unDemotes.delete(user.uid);
        }
      }
    }
    this._doClear(e);
  }
  _doPromote(e) {
    e.stopPropagation();
    for (const user of this.promotables) {
      if (user.selected) {

        if (user.unlikely === 1) {
          user.unlikely = 0;
          //the following two are deliberately backwards (system demotes, user perception is promote)
          this.unPromotes.delete(user.uid);
          this.unDemotes.add(user.uid);
        } else 
        if (user.member_approve === 1) {
          user.global_admin = 1
          this.gaPromotes.add(user.uid);
        } else {
          user.member_approve = 1;
          this.maPromotes.add(user.uid);
          this.maDemotes.delete(user.uid);
        }
      }
    }
    this._doClear(e);
  }
  _doSave(e) {
    e.stopPropagation();
    
    this.dispatchEvent(new PromoteList({
      ga: Array.from(this.gaPromotes.values()), 
      map: Array.from(this.maPromotes.values()), 
      mad: Array.from(this.maDemotes.values()),
      unp: Array.from(this.unPromotes.values()),
      und: Array.from(this.unDemotes.values())
    }));
  }
  _doSelect(e) {
    e.stopPropagation();
    for (const user of this.promotables) user.selected = true;
    this.requestUpdate();
  }
  _toggleSelected(e) {
    e.stopPropagation();
    const user = this.promotables.find(user => user.uid.toString() === e.currentTarget.dataset.uid);
    if (user !== undefined) {
      user.selected = !user.selected;
      this.requestUpdate();
    }
  }
}
customElements.define('gadm-promote', GadmPromote);