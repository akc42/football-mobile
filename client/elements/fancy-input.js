/**
    @licence
    Copyright (c) 2019 Alan Chandler, all rights reserved

    This file is part of PASv5, an implementation of the Patient Administration
    System used to support Accuvision's Laser Eye Clinics.

    PASv5 is licenced to Accuvision (and its successors in interest) free of royality payments
    and in perpetuity in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
    implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. Accuvision
    may modify, or employ an outside party to modify, any of the software provided that
    this modified software is only used as part of Accuvision's internal business processes.

    The software may be run on either Accuvision's own computers or on external computing
    facilities provided by a third party, provided that the software remains soley for use
    by Accuvision (or by potential or existing customers in interacting with Accuvision).
*/
/*
    `<pas-input>` Provides a stylised input element and label for use

*/

import { LitElement, html } from '../libs/lit-element.js';
import {ifDefined} from '../libs/if-defined.js';
import {classMap} from '../libs/class-map.js';

import style from '../styles/input.js';
import { ValueChanged } from '../modules/events.js';

class FancyInput extends LitElement {
  static get styles() {
    return [style];
  }

  static get properties() {
    return {
      combo: {type: Boolean},
      label: {type: String},
      disabled: {type: Boolean},
      invalid: {type: Boolean, reflect: true},
      title: {type: String},
      type: {type: String},
      pattern: {type: String},
      preventInvalid: {type: Boolean},
      placeholder: {type: String},
      autocomplete: {type: String},
      autofocus: {type: Boolean},
      form: {type: String},
      items: {type: Array}, //can either be array of strings or array of objects with {id: value, name: label}
      name: {type: String},
      readonly: {type: Boolean},
      required: {type: Boolean},
      value: {type: String},
      maxlength: {type: Number},
      minlength: {type: Number},
      max: {type: Number},
      min: {type: Number},
      step: {type: Number},
      message:{type: String},
      _placeholder: {type: String},
      validator: {type: Function},
      textArea: {type: Boolean},
      cols: {type: Number},
      rows: {type: Number},
      wrap: {type: String}
    };
  }
  constructor() {
    super();
    this.combo = false;
    this.items = [];
    this.label = '';
    this.name = '';
    this.type='text';
    this.disabled = false;
    this.autofocus = false;
    this.readonly = false;
    this.required = false;
    this.preventInvalid = false;
    this.value = '';
    this.invalid = false;
    this.textArea = false;
    this.message = 'Invalid Input';
    this._placeholder = this.label; //only for now
    this._inputChanged = this._inputChanged.bind(this);
  }
  update(changed) {
    if (changed.has('placeholder') || changed.has('label')) {
      this._placeholder = this.placeholder || this.label;
    }
    if (changed.has('value') && changed.get('value') !== undefined) {
      this.dispatchEvent(new ValueChanged(this.value));
    }
    super.update();
  }
  firstUpdated() {
    this.input = this.shadowRoot.querySelector('#input');
  }
  updated(changed) {
    if (changed.has('combo')) {
      if (this.combo) {
        this.list = 'dropdown';
      } else {
        delete this.list;
      }
    }
    super.updated(changed);
  }
  render() {
    const value = (this.combo && this.items.length > 0 && typeof this.items[0] !== 'string' ?
      this.items.find(i => i.id === this.value).name : this.value) || '';
    return html`
      <label id="label" for="input" class=${classMap({
    inplace: value.length > 0,
    error: this.invalid})}>${this.label}</label>
      ${this.textArea ?  html`
        <textarea
          id="input"
          aria-labelledby="label"
          ?disabled=${this.disabled}
          name=${this.name}
          ?readonly=${this.readonly}
          placeholder=${this._placeholder}
          autocomplete=${ifDefined(this.autocomplete)}
          ?autofocus=${this.autofocus}
          form=${ifDefined(this.form)}
          maxlength=${ifDefined(this.maxlength)}
          minlength=${ifDefined(this.minlength)}
          cols=${ifDefined(this.cols)}
          rows=${ifDefined(this.rows)}
          wrap=${ifDefined(this.wrap)}
          .value=${value}
          @input=${this._inputChanged}></textarea>
      ` : html`
        <input
          id="input"
          type=${this.type}
          aria-labelledby="label"
          ?disabled=${this.disabled}
          title=${ifDefined(this.title)}
          pattern=${ifDefined(this.pattern)}
          placeholder=${this._placeholder}
          autocomplete=${ifDefined(this.autocomplete)}
          ?autofocus=${this.autofocus}
          form=${ifDefined(this.form)}
          list=${ifDefined(this.list)}
          name=${this.name}
          maxlength=${ifDefined(this.maxlength)}
          minlength=${ifDefined(this.minlength)}
          ?readonly=${this.readonly}
          ?required=${this.required}
          .value=${value}
          max=${ifDefined(this.max)}
          min=${ifDefined(this.min)}
          step=${ifDefined(this.step)}
          @input=${this._inputChanged}
        />
        ${this.combo ? html`
          <datalist id="dropdown">
            ${this.items.map(item => html`<option ripple>${typeof item === 'string' ? item : item.name}</option>`)}
          </datalist>`:''}
        `}
      <div class="errorcontainer">
        ${this.invalid ? html`<div class="error">${this.message}</div>` : ''}
      </div>
    `;
  }
  focus() {
    if (this.input !== undefined) this.input.focus();
  }
  validate() {
    if (this.input !== undefined && !this.input.validity.valid) {
      this.invalid = true;
    } else if (typeof this.validator === 'function' ) {
      this.invalid = !this.validator(this.input === undefined ? this.value : this.input.value);
    } else {
      this.invalid = false;
    }
    return !this.invalid;
  }
  _inputChanged(e) {
    e.stopPropagation();
    this.validate();
    if (!(this.invalid && this.preventInvalid)) {
      if (this.combo && this.items.length > 0 && typeof this.items[0] !== 'string') {
        this.value = this.items.find(item => item.name === e.target.value).id;
      }
      this.value = e.target.value;
    }
  }
}
customElements.define('fancy-input', FancyInput);
