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
import { html, css } from '../libs/lit-element.js';
import { cache } from '../libs/cache.js';

import RouteManager from './route-manager.js';
import { MenuAdd, MenuReset, WaitRequest, CompetitionsReread } from '../modules/events.js';
import api from '../modules/api.js';
import global from '../modules/globals.js';
import { switchPath } from '../modules/utils.js';
import Debug from '../modules/debug.js';
const debug = new Debug('approve');
import './calendar-dialog.js';


/*
     <approve-manager>: Competition Approval of Membership Requests
*/
class ApproveManager extends RouteManager{
  static get styles() {
    return css`
      :host {
        height: 100%;
      }
    `;
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
      ${cache({
        home: html`<approve-home
          .members=${this.members}
          managed-page
          ></approve-home>`,
        email: html`<approve-email
          managed-page
          ></approve-email>`,
      }[this.page])}
    `;
  }
  loadPage(page) {
    debug(`loading ${page}`);
    this.dispatchEvent(new WaitRequest(true));
    import(`./approve-${page}.js`).then(() => this.dispatchEvent(new WaitRequest(false)));
    if (page === this.homePage()) {
      this.dispatchEvent(new MenuReset());
    } else {
      this.dispatchEvent(new MenuAdd());
    }
  }
  async _newRoute() {
    this.dispatchEvent(new WaitRequest(true));
    const response = await api('approve/members_waiting');
    this.dispatchEvent(new WaitRequest(false));
    this.members = response.members;

  }
}
customElements.define('approve-manager', ApproveManager);
