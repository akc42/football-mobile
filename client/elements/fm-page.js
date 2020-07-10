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

import './app-page.js';
import page from '../styles/page.js';
import style from '../styles/fm-page.js';
import api from '../modules/api.js';

/*
     <fm-page>: Slot "heading" for info for competition heading bar
*/
class FmPage extends LitElement {
  static get styles() {
    return [style,page];
  }
  static get properties() {
    return {
      name: {type: String},
      heading: {type: String}
    };
  }
  constructor() {
    super();
    this.name = '<!--NO NAME-->'; //if name is this when connected, we need to fetch it, else its supplied
    this.heading = '';
  }
  connectedCallback() {
    super.connectedCallback();
    api('user/fetch_comp_name').then(response => this.name = response.name);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.name = '<!--NO NAME-->';
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

      <app-page id="page" heading="${this.heading}">
        <div class="competition">
          <slot name="heading"></slot><div>${this.name}</div>
        </div>
        <slot></slot>
      </app-page>
    `;
  }
}
customElements.define('fm-page', FmPage);