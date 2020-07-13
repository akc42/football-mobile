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
import {cache} from '../libs/cache.js';

import './app-page.js';
import page from '../styles/page.js';
import style from '../styles/fm-page.js';
import api from '../modules/api.js';
import global from '../modules/globals.js';
import { switchPath } from '../modules/utils.js';

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
      heading: {type: String},
      canPick: {type: Boolean}  //Flag to see picks
    };
  }
  constructor() {
    super();
    this.name = '<!--NO NAME-->'; //we need to fetch it but a comment will do in the meantime
    this.heading = '';
    this.canPick = false;
  }
  connectedCallback() {
    super.connectedCallback();
    this.canPick = false;
    const check = global.lcid === global.cid
    api('user/fetch_comp_name',{check: check}).then(response => {
      this.name = response.name
      if (check) this.canPick = response.canpick;
    });
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

      <app-page id="page" .heading="${this.heading}">
        ${cache(this.canPick?html`
         <div slot="subheading" @click=${this._makePicks}>PlayOff Picks Available</div>
        `:'')}
        <div class="competition">
          <slot name="heading"></slot><div id="compname">${this.name}</div>
        </div>
        <slot></slot>
      </app-page>
    `;
  }
  _makePicks(e) {
    e.stopPropagation();
    switchPath(`/teams/user/${global.uid}`);                                             
  }
}
customElements.define('fm-page', FmPage);