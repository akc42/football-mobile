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

import api from '../modules/api.js';
import Route from '../modules/route.js';

import page from '../styles/page.js';

import './fm-list.js';
import './fm-user-summary.js';
import './app-page.js';

/*
     <fm-scores>
*/
class FmScores extends LitElement {
  static get styles() {
    return [page];
  }
  static get properties() {
    return {
      users: {type: Array},
      route: {type: Object},
      name: {type: String}
    };
  }
  constructor() {
    super();
    this.users = [];
    this.route = {active: false};
    this.cRouter = new Route('/:cid','page:scores');
  }
  connectedCallback() {
    super.connectedCallback();


  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    if (changed.has('route') && this.route.active ) {
      const cr = this.cRouter.routeChange(this.route);
      if (cr.active) this._fetchUser(cr.params); 
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
      .container {
        background-color: var(--app-primary-color);
        border:2px solid var(--app-accent-color);
        border-radius: 5px;
        box-shadow: 1px 1px 3px 0px rgba(0,0,0,0.31);
        margin:5px 5px 5px 3px;
        display: grid;
        grid-gap:2px;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-areas:
          "user rs ps"
          "user ts ts";
      }
      .competition {
        background-color: white;
        border:2px solid var(--app-accent-color);
        border-radius: 5px;
        box-shadow: 1px 1px 3px 0px rgba(0,0,0,0.31);
        margin:5px 5px 5px 3px;
        display: flex;
        flex-direction: row;
        justify-content: center;       
      }
      .un,.rs,.ps,.ts {
        background-color: white;
        color:var(--app-primary-text);
        text-align: center;
        vertical-align: center;
        font-weight: bold;
      }
      .un {
        grid-area:user
      }

      .rs {
        grid-area:rs;
      }
      .ps {
        grid-area: ps;
      }
      .ts {
        grid-area:ts;
      }
    </style>
    <app-page heading="Summary">
        <div class="competition">
          <div>${this.name}</div>
        </div>
        <fw-list custom="fw-user-summary"  .items=${this.users}>
        <div slot="header" class="container">
          <div class="un">Name</div>
          <div class="rs">Round Score</div>
          <div class="ps">Playoff Score</div>
          <div class="ts">Total Score</div>
        </div>
      </fw-list>
    </app-page>
    `;
  }
  async _fetchUser(params) {
    
    if (params.cid === '') {
      //no cid provided in url so we need to find it
      const cid = await api('admin/default_comp');
      this.cRouter.params = cid;
    } else {
      const name = await api(`${params.cid}/fetch_comp_name`);
      this.name = name.name;
      const users= await api(`${params.cid}/users_summary`);
      this.users = users.users;
    }
    
  }
}
customElements.define('fm-scores', FmScores);