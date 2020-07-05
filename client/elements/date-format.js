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
import {classMap} from '../libs/class-map.js';


const dateFormatter = Intl.DateTimeFormat('default', {
  dateStyle: 'medium'
});
const dateTimeFormatter = Intl.DateTimeFormat('default', {
  dateStyle: 'medium',
  timeStyle: 'short'
});
import style from '../styles/date-format.js';
/*
     <date-format>
*/
class DateFormat extends LitElement {
  static get styles() {
    return [style];
  }
  static get properties() {
    return {
      date:{type: Number}, //this is the date time in seconds since 1970
      withTime: {type: Boolean},
      dateString: {type: String},

    };
  }
  constructor() {
    super();
    this.date = 0;
    this.withTime = false;
    this.dateString = '';
  }
  update(changed) {
    if(changed.has('date') || changed.has('withTime')) {
      if (this.date !== 0) {
        const when = new Date().setTime(this.date * 1000);
        this.dateString = this.withTime? dateTimeFormatter.format(when) : dateFormatter.format(when);
      } else {
        this.dateString = 'No Date Set';
      }
    }
    super.update(changed);
  }

  render() {
    return html`
      <div class="date ${classMap({time: this.withTime})}">
        <span>${this.dateString}</span>
      </div>
    `;
  }

}
customElements.define('date-format', DateFormat);