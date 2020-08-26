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
import './waiting-indicator.js';
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
      promoteables: {type: Array}, //Can't promote global_admins so this is the list without them (although will contain promoted until until saved)
      users: {type: Array},
      selectedUser: {type: Number},
      waiting: {type: Boolean}
    };
  }
  constructor() {
    super();
    this.promotables = [];
    this.users = [];
    this.selectedUser = 0;
    this.waiting = false;

  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
 
  }
  update(changed) {
    if (changed.has('users')) {
      this.waiting = false;
      //we need to clone the user objects so that there are no references
      this.promoteables = JSON.parse(JSON.stringify(this.users.filter(u => u.global_admin === 0))); //we cannot promote global admins any more.
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
        #container {
          display: flex;
          flex-direction: column;
        }
        #explain {
          grid-area: explain;
        }
        #staff {
          grid-area: staff;
        }
        #userlist {
          height: 90%;
          overflow-y: scroll;
          scroll-snap-type: y mandatory;
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
      <waiting-indicator ?waiting=${this.waiting}></waiting-indicator>
      <fm-page id="page" heading="Global Admin">
        <div slot="subheading">Promote Users</div>
        <div id="container">
          <section id="explain">
            <p>TODO explain here</p>
          </section>
          <section id=staff>
            <div class="button" @click=${this._doSelect}><material-icon>group</material-icon><div>Select All</div></div>
            <div class="button" @click=${this._doClear}><material-icon>people_outline</material-icon><div>Clear All</div></div>
            <div class="button" @click=${this._doPromote}><material-icon>person_add</material-icon><div>Premote Selected</div></div>
            <div class="button" @click=${this._doDemote}><material-icon>person_remove</material-icon><div>Demote Selected</div></div>
            <div class="button" @click=${this._doSave}><material-icon>save</material-icon><div>Save Changes</div></div>
            <div id="userlist">
              ${cache(this.promoteables.map(user => html`
                <div class="row u" data-uid="${user.uid}" @click=${this._toggleSelected}>
                  <div class="name">${user.name}</div>
                  ${user.previous_admin !== 0 ? html`<material-icon class="pa">font_download</material-icon>` : html`<div class="iconreplace"></div>`}
                  ${user.global_admin !== 0 ? html`<material-icon class="ga">public</material-icon>` : html`<div class="iconreplace"></div>`}
                  ${user.member_approve !== 0 ? html`<material-icon class="ma">grading</material-icon>` : html`<div class="iconreplace"></div>`}
                  <material-icon class="us">${user.selected ? 'check_box' : 'check_box_outline_blank'}</material-icon>
                </div>
              `))}
            </div>

          </section>
        </div>
      </fm-page>
    `;
  }
  _doClear(e) {
    e.stopPropagation();
    for (const user of this.premoteables) user.selected = false;
    this.requestUpdate();
  }
  _doDemote(e) {
    e.stopPropagation();
    for(const user of this.promotables) {
      if (user.selected) {
        if (user.global_admin === 1) {
          user.global_admin = 0;
        } else {
          user.member_approve === 0;
        }
      }
    }
  }
  _doPromote(e) {
    e.stopPropagation();
    for (const user of this.promotables) {
      if (user.selected) {
        if (user.member_approve === 1) {
          user.global_admin = 1
        } else {
          user.member_approve === 1;
        }
      }
    }
  }
  _doSave(e) {
    e.stopPropagation();
    this.waiting = true;
    this.dispatchEvent(new PromoteList(this.premoteables));
  }
  _doSelect(e) {
    e.stopPropagation();
    for (const user of this.promoteables) user.selected = true;
    this.requestUpdate();
  }
  _toggleSelected(e) {
    e.stopPropagation();
    const user = this.promoteables.find(user => user.uid.toString() === e.currentTarget.dataset.uid);
    if (user !== undefined) {
      user.selected = !user.selected;
      this.requestUpdate();
    }
  }
}
customElements.define('gadm-promote', GadmPromote);