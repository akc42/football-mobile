/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file provided as part of Football-Mobile

    Page Manager is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Page Manager is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Page Manager.  If not, see <http://www.gnu.org/licenses/>.
*/


import { html } from '../libs/lit-element.js';
import {cache} from '../libs/cache.js';

import {connectUrl, disconnectUrl} from '../modules/location.js';
import global from '../modules/globals.js';

import PageManager from './page-manager.js';
import './app-waiting.js';

import page from '../styles/page.js';

export class FmPages extends PageManager {
  static get styles() {
    return [page];
  }

  connectedCallback() {
    super.connectedCallback();
    connectUrl(route => this.route = route);
    this.removeAttribute('unresolved');
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    disconnectUrl();
  }

  render() {
    return html`

      <app-waiting ?waiting=${this.waiting}></app-waiting>
      ${cache({
        home:html`<fm-home managed-page></fm-home>`,
        soon: html`<fm-soon namaged-page></fm-soon>`,
        register: html`<fm-register managed-page></fm-register>`,
        teams: html`<fm-teams managed-page .route=${this.subRoute}></fm-teams>`,
        rounds:html`<fm-rounds managed-page .route=${this.subRoute}></fm-rounds>`,
        summary: html`<fm-summary managed-page .route=${this.subRoute}></fm-summary>`,
        approve: html`<fm-approve managed-page></fm-approve>`,
        admin: html`<fm-admin managed-page .route=${this.subRoute}></fm-admin>`,
        gadm: html`<fm-gadm managed-page .route=${this.subRoute}></fm-gadm>`,
        profile: html`<app-profile managed-page></app-profile>`,
        navref: html`<fm-navref managed-page></fm-navref>`,
        help: html`<fm-help managed-page></fm-help>`
      }[this.page])}

    `;
  }

  loadPage(page) {
    this.waiting = true;
    if (page === 'profile') {
      import('./app-profile.js').then(this.waiting = false);
    } else {
      import(`./fm-${page}.js`).then(this.waiting = false);
    }
   }
  _keyAppointmentFile(e) {
    e.stopPropagation();
    switch (e.entity) {
      default:
    }
  }
  _keyDiaryPatient(e) {
    e.stopPropagation();
    switch(e.entity) {
      default:
    }
  }
}
customElements.define('fm-pages',FmPages);
