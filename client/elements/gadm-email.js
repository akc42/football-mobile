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


/*
     <gadm-email>: Allow us to send emails to one or more users
*/
class GadmEmail extends LitElement {
  static get styles() {
    return [page, button, css``];
  }
  static get properties() {
    return {

      users: {type: Array}
    };
  }
  constructor() {
    super();
    this.users = [];
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
      </style>
      <fm-page id="page" heading="Global Admin">
        <div slot="subheading">Email Users</div>
        <header id="explain">
        </header>
        <section class="scrollable">

          <section id=staff>  
            <div id="userlist">
              ${cache(this.users.map(user => html`
                <div class="row u" data-uid="${user.uid}" @click=${this._toggleSelected}>
                  <div class="name">${user.name}</div>
                  <div class="email">${user.email}</div>
                  ${user.previous_admin !== 0 ? html`<material-icon class="pa">font_download</material-icon>`: html`<div class="iconreplace"></div>`}
                  ${user.global_admin !== 0 ? html`<material-icon class="ga">public</material-icon>` : html`<div class="iconreplace"></div>`}
                  ${user.member_approve !== 0 ? html`<material-icon class="ma">grading</material-icon>` : html`<div class="iconreplace"></div>`}
                  <material-icon class="us">${user.selected ? 'check_box' : 'check_box_outline_blank'}</material-icon>
                </div>
              `))}
            </div>

          </section>
        </section>
          <button slot="action" @click=${this._doSelect}><material-icon>group</material-icon><div>Select All</div></button>
          <button slot="action" @click=${this._doClear}><material-icon>people_outline</material-icon><div>Clear All</div></button>
          <button slot="action" @click=${this._doCompose}><material-icon>email</material-icon><div>Email Selected Users</div></button>

      </fm-page>
    `;
  }
  _doClear(e) {
    e.stopPropagation();
    for(const user of this.users) {
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
customElements.define('gadm-email', GadmEmail);