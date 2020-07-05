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
import { unsafeHTML } from '../libs/unsafe-html.js';
import {cache} from '../libs/cache.js';

import api from '../modules/api.js';

import './date-format.js';
import './app-page.js';
import page from '../styles/page.js';

//temporary
import './calendar-input.js';


/*
     <fm-soon>
*/
class FmSoon extends LitElement {
  static get styles() {
    return [page];
  }
  static get properties() {
    return {
      soon: {type: String},
      expected: {type: Number},
      condition: {type:String}
    };
  }
  constructor() {
    super();
    this.soon = '';
    this.expected = 0;
    this.condition = '';
  }
  connectedCallback() {
    super.connectedCallback();
    api('user/coming_soon').then(response => {
      this.soon = response.message;
      this.expected = response.date;
      this.condition = response.condition;
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
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
      <style>
        .condition {
          font-weight: bold;
          color: red;
        }
      </style>
       <app-page id="page" heading="Coming Soon">
        <p>${unsafeHTML(this.soon)}</p>
        ${cache(this.expected !== 0 ? html`
          <p>The competition is expected to be open on <date-format .date=${this.expected}></date-format></p>
        `:'')}
        ${cache(this.condition? html`<p>When open, the condition for registering will be:- </p>
        <p class="condition">${this.condition}.</p>`:'')}

        <p>Temporary trial of <calendar-input .value=${this.expected} withtime @value-changed=${this._newExpected}></calendar-input></p>
        
      </app-page>
    `;
  }
  _newExpected(e) {
    e.stopPropagation();
    console.log('got an value changed event from calendar input',e.changed)
  }
}
customElements.define('fm-soon', FmSoon);