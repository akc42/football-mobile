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

import RouteManager from './route-manager.js';
import './waiting-indicator.js';

import page from '../styles/page.js';
import './comment-dialog.js';
import './comment-panel.js';

export class PageManager extends RouteManager {
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
      <comment-dialog></comment-dialog>
      <comment-panel></comment-panel>
      <app-waiting ?waiting=${this.waiting}></app-waiting>
      ${cache({
        home:html`<home-manager managed-page></home-manager>`,
        soon: html`<soon-manager namaged-page></soon-manager>`,
        register: html`<register-manager managed-page></register-manager>`,
        teams: html`<teams-manager managed-page .route=${this.subRoute}></teams-manager>`,
        rounds:html`<rounds-manager managed-page .roundRoute=${this.subRoute}></rounds-manager>`,
        scores: html`<scores-manager managed-page .route=${this.subRoute}></scores-manager>`,
        approve: html`<approve-manager managed-page></approve-manager>`,
        admin: html`<admin-manager managed-page .route=${this.subRoute}></admin-manager>`,
        gadm: html`<gadm-manager managed-page .route=${this.subRoute}></gadm-manager>`,
        profile: html`<profile-manager managed-page></profile-manager>`,
        navref: html`<navref-manager managed-page></navref-manager>`,
        help: html`<help-manager managed-page></help-manager>`
      }[this.page])}

    `;
  }

  loadPage(page) {
    this.waiting = true;
    import(`./${page}-manager.js`).then(this.waiting = false);
   }

}
customElements.define('page-manager',PageManager);
