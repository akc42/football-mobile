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
import page from '../styles/page.js';
import button from '../styles/button.js';

/*
     <gadm-manager>: Main Page for all the global admin functions
*/
class AdminEmail extends LitElement {
  static get styles() {
    return [page, button, css`
        :host {
          --icon-size: 20px;
        }
        .row {
          display: grid;
          grid-gap: 2px;
          grid-template-columns: 1fr repeat(3, 20px);
          grid-template-areas: 
            "name . . ."
            "email email email select";

        }
        #container {
          display: flex;
          flex-direction: column;
        }
        #explain {
          display: flex;
          flex-direction: row;
          margin: 10px 0;
        }
        #explain .button {
          margin: 5px;
          border: none;
          padding: 5px;
          border-radius:5px;
          box-shadow: 2px 2px 5px 4px var(--shadow-color);
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
          grid-area: name;
        }
        .email {
          grid-area: email;
        }
        .pa, .ga, .ma, .us, .iconreplace {
          width: 20px;
          margin: 0 2px;
        }
        .us {
          grid-area: select;
        }
        .u {
          cursor: pointer;
          border-bottom: 1px dotted var(--accent-color);
          margin-bottom: 1px;
          scroll-snap-align: start;
        }

        a, a:link, a:visited {
          color: var(--color)!important;
    
        }
    `];
  }
  static get properties() {
    return {
      users: {type: Array}
    };
  }
  constructor() {
    super();
    this.users = [];
    this.contactableUsers = [];
    this.emailString = '';
  }

  update(changed) {
    this.contactableUsers = this.users.filter(u => u.unlikely === 0);
    let emailString = '';
    for (const user of this.contactableUsers) {
      if (user.selected) {
        emailString += user.email + ',';
      }
    }
    this.emailString = emailString.slice(0, -1);
    super.update(changed);
  }

  render() {
    return html`
      <style>
        :host {
          --icon-size: 20px;
        }
        .row {
          display: grid;
          grid-gap: 2px;
          grid-template-columns: 1fr repeat(3, 20px);
          grid-template-areas: 
            "name . . ."
            "email email email select";

        }
        #container {
          display: flex;
          flex-direction: column;
        }
        #explain {
          display: flex;
          flex-direction: row;
          margin: 10px 0;
        }
        #explain .button {
          margin: 5px;
          border: none;
          padding: 5px;
          border-radius:5px;
          box-shadow: 2px 2px 5px 4px var(--shadow-color);
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
          grid-area: name;
        }
        .email {
          grid-area: email;
        }
        .pa, .ga, .ma, .us, .iconreplace {
          width: 20px;
          margin: 0 2px;
        }
        .us {
          grid-area: select;
        }
        .u {
          cursor: pointer;
          border-bottom: 1px dotted var(--accent-color);
          margin-bottom: 1px;
          scroll-snap-align: start;
        }

        a, a:link, a:visited {
          color: var(--color)!important;
    
        }


      </style>
      <football-page id="page" heading="Registered Members" nohead>
        <section class="scrollable">
          ${cache(this.contactableUsers.map(user => html`
            <div class="row u" data-uid="${user.uid}" @click=${this._toggleSelected}>
              <div class="name">${user.name}</div>
              <div class="email">${user.email}</div>
              ${user.previous_admin !== 0 ? html`<material-icon class="pa">font_download</material-icon>` : html`<div class="iconreplace"></div>`}
              ${user.global_admin !== 0 ? html`<material-icon class="ga">public</material-icon>` : html`<div class="iconreplace"></div>`}
              ${user.member_approve !== 0 ? html`<material-icon class="ma">grading</material-icon>` : html`<div class="iconreplace"></div>`}
              <material-icon class="us">${user.selected ? 'check_box' : 'check_box_outline_blank'}</material-icon>
            </div>
          `))}
        </section>
          <button slot="action" @click=${this._doSelect}><material-icon>group</material-icon> Select All</button>
          <button slot="action" @click=${this._doClear}><material-icon>people_outline</material-icon> Clear All</button>
          <button slot="action"><a href="mailto:${this.emailString}"><material-icon>email</material-icon>Email Selected Users</a></button>

      </football-page>
    `;
  }
  _doClear(e) {
    e.stopPropagation();
    for (const user of this.users) {
      user.selected = false;
    }
    this.requestUpdate();
  }
  _doCompose(e) {
    e.stopPropagation();
    alert('Not implemented yet');
  }
  _doSelect(e) {

    for (const user of this.users) {
      user.selected = true;
    }
    this.requestUpdate();
  }
  _toggleSelected(e) {
    e.stopPropagation();
    const user = this.users.find(user => user.uid.toString() === e.currentTarget.dataset.uid);
    if (user !== undefined) {
      user.selected = !user.selected;
      this.requestUpdate();
    }
  }

}
customElements.define('admin-email', AdminEmail);