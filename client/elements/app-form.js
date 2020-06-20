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

/*
    `<app-form>` Provides a form simulated by ajax
      It looks for children with a validate function to validate the components
      it looks for children with a name and value attribute to pick to send to the url provided.

*/

import { LitElement, html } from '../libs/lit-element.js';
import api from '../modules/api.js';
import walk from '../modules/walk.js';
import {FormResponse } from '../modules/events.js';

class AppForm extends LitElement  {
  render() {
    return html`
      <style>
        :host {
          display: contents;

        }
        ::slotted(*) {
          background-color: var(--app-form-color);
          border-radius: 5px;
        }
      </style>
      <slot id="mychildren"></slot>
    `;
  }
  static get properties() {
    return {
      action: {type: String}
    };
  }
  constructor() {
    super();
    this.action = '';
  }
  get params() {
    return this._params;
  }
  validate() {
    let result = true;
    const slot = this.shadowRoot.querySelector('#mychildren');
    walk(slot, node => {
      if (typeof node.validate === 'function') {
        const v = node.validate();
        if (!v) result = false;
      }
      return false;
    });
    return result;
  }
   submit() {
    const result = this.validate();
    if (result) {
      this._params = {};
      const slot = this.shadowRoot.querySelector('#mychildren');
      walk(slot, node => {
        if (node.value !== undefined && node.name !== undefined) {
          this._params[node.name] = node.value;
          return true;
        }
        return false;
      });
      api(this.action, this.params).then(response => this.dispatchEvent(new FormResponse(response)));
    }
    return result;
  }
}
customElements.define('app-form', AppForm);
