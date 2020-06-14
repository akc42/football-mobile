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
import './fm-summary.js';

import page from '../styles/page.js';

export class AppPages extends PageManager {
  static get styles() {
    return [page];
  }
  static get properties() {
    return {
      name: { type: String },
      email: { type: String },
      password: { type: String },
      replica: { type: String },
      remember: { type: Boolean }
    };
  }


  constructor() {
    super();
    this.last = 0;

    Promise.all([
      import('./fm-comment-dialog.js')
    ]).then(() => {
      performance.mark('dialogs_loaded');
      performance.measure('dialogs-loadtime','pages_attached','dialogs_loaded');
    });
  }
  connectedCallback() {
    super.connectedCallback();
    connectUrl(route => this.route = route);
    performance.mark('pages_attached');
    performance.measure('page-loadtime','pages_loading','pages_attached');
    this.removeAttribute('unresolved');
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    disconnectUrl();
  }

  render() {
    return html`
      <app-waiting ?waiting=${this.waiting}></app-waiting>
      ${cache('picks:playoff:newround'.indexOf(this.page) >= 0 ? html`
        <fm-comment-dialog></fm-comment-dialog>
      ` : '')}
      ${cache('competition:round'.indexOf(this.page) >= 0 ? html`
        <overwrite-dialog></overwrite-dialog>
      ` : '')}
      <section role="main">
      ${cache({
        home: html`<fm-summary 
          managed-page
          .route=${this.subRoute}>Summary Loading ...</fm-summary>`,
        profile: html`<app-profile
          managed-page
          .route=${this.subRoute}>Profile Loading ...</app-profile>`
      }[this.page])}
      </section>
    `;
  }
  homePage() {
    return 'home';
  }
  loadPage(page) {
    switch (page) {
      case 'profile':
        import('./app-profile.js');
        break;
    }
  }
  _keyAppointmentFile(e) {
    e.stopPropagation();
    switch (e.entity) {
      case 'appointment':
        if (this.pasAppointments) this.pasAppointments.keyUpdate(e.entity, e.key);
        break;
      case 'diary':
        if (this.pasAppointments) this.pasAppointments.keyUpdate(e.entity, e.key);
        break;
      case 'patient':
        if (this.pasAppointments) this.pasAppointments.keyUpdate(e.entity, e.key);
        if (this.pasFilemove) this.pasFilemove.keyUpdate(e.entity, e.key);
        break;
      default:
    }
  }
  _keyDiaryPatient(e) {
    e.stopPropagation();
    switch(e.entity) {
      case 'appointment':
        if (this.pasPatients) this.pasPatients.keyUpdate(e.entity, e.key);
        break;
      case 'diary':
        if (this.pasDiary) this.pasDiary.keyUpdate(e.entity, e.key);
        break;
      case 'patient':
        if (this.pasPatients) this.pasPatients.keyUpdate(e.entity, e.key);
        break;
      default:
    }
  }
}
customElements.define('app-pages',AppPages);
