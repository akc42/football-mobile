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
import {switchPath} from '../modules/utils.js';
import global from '../modules/globals.js';

import './date-format.js';
import './fm-page.js';
import page from '../styles/page.js';
import emoji from '../styles/emoji.js';

//temporary
import './calendar-input.js';


/*
     <soon-manager>
*/
class SoonManager extends LitElement {
  static get styles() {
    return [page, emoji];
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
    api(`user/${global.lcid}/coming_soon`).then(response => {
      if (response.open) {
        //we should not be in this page, lets switch back to home
        switchPath('/');
      } else {
        this.soon = response.message;
        this.expected = response.date;
        this.condition = response.condition;
      }
    });
  }

  render() {
    return html`
      <style>
        .condition {
          font-weight: bold;
          color: red;
        }
      </style>
       <fm-page id="page" heading="Coming Soon">
        <p>${unsafeHTML(this.soon)}</p>
        ${cache(this.expected !== 0 ? html`
          <p>The competition is expected to be open on <date-format .date=${this.expected}></date-format></p>
        `:'')}
        ${cache(this.condition? html`<p>When open, the condition for registering will be:- </p>
        <p class="condition emoji">${this.condition}.</p>`:'')}
      </fm-page>
    `;
  }
}
customElements.define('soon-manager', SoonManager);