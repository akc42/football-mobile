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

import PageManager from './page-manager.js';

import page from '../styles/page.js';
import { switchPath } from '../modules/utils.js';

export class AppPages extends PageManager {
  static get styles() {
    return [page];
  }
  static get properties() {
    return {
      cid: {type: Number},
      rid: {type: Number}
    };
  }


  constructor() {
    super();
    this.cid = 0;
    this.rid = 0;

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
        home:'',
        summary: html`<fm-summary 
          managed-page
          .cid=${this.cid}
          .route=${this.subRoute}>Summary Loading ...</fm-summary>`,
        profile: html`<app-profile
          managed-page>Profile Loading ...</app-profile>`
      }[this.page])}

    `;
  }

  loadPage(page) {
    this.waiting = true;
    switch (page) {
      case 'home':
        switchPath('/summary'); //fall through, since we know its coming and we might as well get ready asap
      case 'summary':
        import('./fm-summary.js').then(this.waiting = false);
        break;
      case 'profile':
        import('./app-profile.js').then(this.waiting = false);
        break;
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
customElements.define('app-pages',AppPages);
