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

import './fm-page.js';
import page from '../styles/page.js';
import './list-manager.js';
import { switchPath } from '../modules/utils.js';
import { WaitRequest } from '../modules/events.js';
import api from '../modules/api.js';


/*
     <approve-manager>: Competition Approval of Membership Requests
*/
class ApproveManager extends LitElement{
  static get styles() {
    return [page, css``];
  }
  static get properties() {
    return {
      members: {type: Array},
      route: {type: Object}
    };
  }
  constructor() {
    super();
    this.members = [];
    this.route = {active: false};
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    if (changed.has('route') && this.route.active) {
      if (global.user.global_admin === 1 || global.user.member_approve === 1) {
        this._newRoute();
      } else {
        switchPath(`/${global.cid}`)
      }
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
      </style>
      <fm-page id="page" heading="New Member Approval">
        <section class="scrollable">
          ${cache(this.members.map(member => html`
            
          `))}
        </section>
      </fm-page>
    `;
  }
  async _newRoute() {
    this.dispatchEvent(new WaitRequest(true));
    const response = await api('approve/members_waiting');
    this.dispatchEvent(new WaitRequest(false));
    this.members = response.members;

  }
}
customElements.define('approve-manager', ApproveManager);
