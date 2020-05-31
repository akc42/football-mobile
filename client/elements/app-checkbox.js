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


/**
 * Substancial parts of this element have been copied from
 * https://github.com/GoogleChromeLabs/howto-components
 * which is licenced as follows:-
 *
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { LitElement, html } from '../libs/lit-element.js';

import './material-icon.js';
import style from '../syles/checkbox.js';

/**
 * Define key codes to help with handling keyboard events.
 */
const KEYCODE = {
  SPACE: 32,
};

class PasCheckbox extends LitElement {
  static get styles() {
    return [style];
  }
  static get properties() {
    return {
      name: { type: String }, //if not undefined will be used in a form
      value: { type: Boolean }, //by useing value rather than checked we can use it pas-form
      disabled: { type: Boolean, reflects: true },
      readonly: { type: Boolean }
    };
  }
  constructor() {
    super();
    //this.name
    this.value = false;
    this.disabled = false;
    this.readonly = false;
  }
  updated(changed) {
    if (changed.has('disabled')) {
      this.checkbox.setAttribute('aria-disabled', this.disabled);
      if (this.disabled) {
        this.checkbox.removeAttribute('tabindex');
        this.checkbox.blur();
      } else {
        this.checkbox.setAttribute('tabindex', '0');
      }
    }
    super.update(changed);
  }
  firstUpdated() {
    this.checkbox = this.shadowRoot.querySelector('#checkmark');
  }
  render() {
    return html`
      <div
        id="checkmark"
        role="checkbox"
        tabindex="0"
        aria-labeled-by="checklabel"
        ?checked="${this.value}"
        ?aria-checked=${this.value}
        ?disabled="${this.disabled}">${this.value ? html`<pas-icon>check</pas-icon>` : ''}</div>
      <label id=checklabel for="checkmark"><slot></slot></label>
    `;
  }
  connectedCallback() {
    super.connectedCallback();

    this.addEventListener('keyup', this._onKeyUp);
    this.addEventListener('click', this._onClick);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keyup', this._onKeyUp);
    this.removeEventListener('click', this._onClick);
  }

  _onKeyUp(event) {
    if (!event.altKey && event.keyCode === KEYCODE.SPACE) {
      event.preventDefault();
      this._toggleChecked();
    }
  }
  _onClick(e) {
    e.stopPropagation();
    this._toggleChecked();
  }
  _toggleChecked() {
    if (this.disabled || this.readonly) return;
    this.value = !this.value;
    this.dispatchEvent(new CustomEvent('value-changed'));
  }
}

customElements.define('pas-checkbox', PasCheckbox);



