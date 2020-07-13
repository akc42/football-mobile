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

let tester;
let codes = [];
api('user/emoticons').then(response => {
  code = response.codes;
  tester = `/:(${response.codes.map(c => c.code).join('|')})/g`;
  codes =c;
});



/*
     <emoticon-string>: This scans the string (provided in the slot) for text of the form ':xxx' were xxx is one of
                        the valid codes in our emoticon table.  If found it converts said string in to 
                        <img src="data:image/png;base64,${icon}"/>, where icon is fetched from the database
*/
class EmoticonString extends LitElement {
  static get styles() {
    return [];
  }
  static get properties() {
    return {
      
    };
  }
  constructor() {
    super();
    this._slotChange = this._slotChange.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.slot !== undefined) this.slot.addEventListener('slotchange', this._slotChange);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.slot.removeEventListener('slotchange', this._slotChange);
  }
  update(changed) {
    super.update(changed);
  }
  firstUpdated() {
    this.slot = this.shadowRoot.querySelector('slot');
    this.slot.addEventEventListener('slotchange', this._slotChange);

  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`
      <slot></slot>
    `;
  }
  _slotChange() {

  }
}
customElements.define('emoticon-string', EmoticonString);