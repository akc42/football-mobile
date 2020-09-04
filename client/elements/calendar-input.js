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
import { LitElement, html, css } from '../libs/lit-element.js';

import './date-format.js';

import { CalendarRequest } from '../modules/events.js';



/*
     <calendar-input>: this is the main calendar picking widget for the entire app.
              The only required property is "value".  This is the unix epoch value, which
              is assumed to represent time in the database.

              Optional properties are "name" which can be set and read back so that it appears like
              a form, and "withTime" (set as attribute withtime ?) which means include the time of day
              to nearest 5 minutes as part of the selection algorithmn.

              The calendar does have a "validate" method which will validate if a value is set, but will fail
              if the value is not set.

              It will fire a value changed event when the pop up dialog closes, not when the value is changing
              because of selection in the picker.


*/
class CalendarInput extends LitElement {
  static get styles() {
    return css`
      :host {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        --icon-size:20px;
      }
      #input {
        display: flex;
        flex-direction: row;
        justify-content:space-evenly;
        align-items: center;
        border: 2px solid var(--accent-color);
        cursor: pointer;
      } 
    `;
  }

  static get properties() {
    return {
      value: {type: Number}, //seconds since 1970 - provided by the outside
      name: {type: String, reflect: true},  //can be used in forms.
      withTime: {type: Boolean},  //should it display time as well
      label: {type: String}
    };
  }
  constructor() {
    super();
    const d = new Date();
    this.value = Math.floor(d.getTime()/1000);
    this._calendarReply = this._calendarReply.bind(this);
    this.withTime = false;
    this.label = '';
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('calendar-reply', this._calendarReply);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('calendar-reply', this._calendarReply);
  }
  update(changed) {
    if (changed.has('value') && this.value === null) {
      this.value = 0;
    } 
    super.update(changed);
  }

  render() {
    return html`
    <style>

    </style>
    <label for="input">${this.label}</label>
    <div id="input" class="input" @click=${this._show}>
      <date-format .date=${this.value}  .withTime=${this.withTime}></date-format><material-icon>date_range</material-icon>
    </div>

    `;
  }

  validate() {
    return this.value !== 0;  //not sure about this - might need to always return true
  }
  _calendarReply(e) {
    e.stopPropagation();
    this.value = e.date;
  }
  _show() {
    this.dispatchEvent(new CalendarRequest({date: this.value, time: this.withTime}))
  }
  
}
customElements.define('calendar-input', CalendarInput);