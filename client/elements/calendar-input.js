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
import {classMap} from '../libs/class-map.js';
import {guard} from '../libs/guard.js';


import calendar from '../styles/calendar.js';
import button from '../styles/button.js';

import { ValueChanged } from '../modules/events.js';
import { manageVisitCookie } from '../modules/visit.js';

const monthFormatter = Intl.DateTimeFormat('default', {
  month: 'long'
});
const weekdayFormatter = Intl.DateTimeFormat('default', {
  weekday: 'narrow'
})

const weekdayMaker = new Date('2020-07-05 3:00');  //this is a sunday (near the beginning of the month, so 7 days later it is still the same month)
const weekdays = [];
for(let i = 0; i < 7; i++) {
  weekdays.push(weekdayFormatter.format(weekdayMaker));
  weekdayMaker.setDate(weekdayMaker.getDate() + 1);
}
const hours = [];
const mins = [];
for (let i = 0; i < 12; i++) {
  hours.push({
    offset: i ,  //seconds offset into the 12 hour period covered
    hour: ((i + 11) % 12 + 1).toString()  // what to display
  })
  mins.push({
    offset: i , //seconds offset
    min: ('0' + (i * 5).toString()).slice(-2),
  })
}





/*
     <app-calendar>
*/
class CalendarInput extends LitElement {
  static get styles() {
    return [calendar, button];
  }

  static get properties() {
    return {
      value: {type: Number}, //seconds since 1970 - provided by the outside
      name: {type: String, reflect: true},  //can be used in forms.
      month: {type: String},
      year:{type:Number},
      withTime: {type: Boolean},
      pm: {type: Boolean},  //set if time triggered to pm
      minuteGuard: {type: Number},
      hourGuard: {type: Number}, //something that only changes if the hour changes
      dayGuard: {type: Number}
    };
  }
  constructor() {
    super();
    const d = new Date();
    this.value = Math.floor(d.getTime/1000);
    this.savedValue = this.value;
    this.setZero = false;
    this.hourGuard = -2;
    this.dayGuard = -2;
    this.minuteGuard = -2;
    this.name = '';
    this.month = monthFormatter.format(d);
    this.year = d.getFullYear();
    this.pm = false;
    this.weeks = [];
  }
  connectedCallback() {
    super.connectedCallback();  
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    if (changed.has('month') || changed.has('year')) {
      const d = new Date();
      if (this.value !== 0) d.setTime(this.value * 1000); //If date is not set, we are using today, but if it set we need to adjust to it.
      const dayMaker = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0); //0 on 1st day of month
      const day = dayMaker.getDay();
      dayMaker.setDate(1 - day);  //we are now at the first sunday
      this.weeks = [];
      const m = (d.getFullYear() * 100) + d.getMonth();  //remember the month we are in
      while (((dayMaker.getFullYear() * 100) + dayMaker.getMonth()) <= m) {
        const week = [];
        for (let i = 0; i < 7; i++) {

          week.push({
            date: Math.floor(dayMaker.getTime() / 1000),
            today: dayMaker.getFullYear() === d.getFullYear() && dayMaker.getMonth() === d.getMonth() && 
                    dayMaker.getDate() === d.getDate(), //used to select day if value not set.
            day: dayMaker.getDate(),
            inMonth: ((dayMaker.getFullYear() * 100) + dayMaker.getMonth()) === m
          });
          dayMaker.setDate(dayMaker.getDate() + 1);
        }
        this.weeks.push(week);
      }

    }
    super.update(changed);
  }
  firstUpdated() {
    this.overlay = this.shadowRoot.querySelector('#picker');
  }
  updated(changed) {
    if (changed.has('value')) {
      const d = new Date();
      d.setTime(this.value * 1000);
      this.month = monthFormatter.format(d);
      this.year = d.getFullYear();
      this.hourGuard = this.value === 0 ? -1 : Math.floor((this.value % 43200) / 3600);
      this.minuteGuard = this.value === 0 ? -1 : Math.floor((this.value % 3600)/300);
      this.dayGuard = this.value === 0 ? -1 : d.getDate();
      this.pm = (this.value % 86400) >= 43200; 
    }
    super.updated(changed);
  }
  render() {
    const dValue = new Date();
    dValue.setTime(this.value * 1000);
    return html`
    <style> 
      :host {
        display: inline-block;
        --icon-size:20px;
        --line-color: #404040;
      }
      .input {
        display: flex;
        flex-direction: row;
        justify-content:space-evenly;
        align-items: center;
        border: 2px solid var(--app-accent-color);
        background-color: white;
        cursor: pointer;
      }
      .container {
        padding: 5px;
        box-shadow: 2px 2px 6px 0px rgba(0,0,0,0.5);
        border-radius: 4px;
        border:2px solid white;
        background-color: var(--app-accent-color);
        color: var(--app-accent-text);
        width: 160px;
      }
      .datepanel {
        display: grid;
        grid-gap: 1px;
        grid-template-columns: repeat(7, 1fr);
        --icon-size: 16px;
        text-align: right;
        margin: 2px 0;
        background-color: var(--line-color);
      }
      .datepanel>.month {
        grid-column: 2 / 7;
        grid-row: 1 / 2;
        text-align: center;
        cursor: default !important;
      }
      .timepanel {
        display: grid;
        grid-gap: 1px;
        grid-template-areas:
          "am am am am pm pm pm"
          "hr hp hp hp hp hp hp"
          "hr  hp hp hp hp hp hp"
          "mi mn mn mn mn mn mn"
          "mi mn mn mn mn mn mn";
        border-top: 2px solid white;
        margin: 2px 0;
        background-color: var(--line-color);
      }
      .datepanel>*, .timepanel>* {
        background-color: var(--app-accent-color);
      }
      .datepanel>* {
        cursor: pointer;
      }
      .datepanel>.wd {
        cursor: default !important;
      }
      .datepanel>.day {
        color: grey;
      }
      .day.inmonth {
        color: white;
      }
      .day.selected, .day.day.inmonth.selected {
        color: #cf0;
      }
      .am, .pm, .hr, .mi , .month{
        color: #cf0;
      }
      .am.selected, .pm.selected {
        color:red;
      }
      .am {
        grid-area: am;
        text-align: right;
        padding-right: 30px;
        cursor:pointer;
      }
      .pm {
        grid-area: pm;
        text-align: left;
        padding-left:30px;
        cursor: pointer;
      }
      .hr {
        grid-area: hr;
      }
      .mi {
        grid-area: mi;
      } 
      .hours {
        grid-area: hp;
      }
      .minutes {
        grid-area: mn;
      }
      .hours, .minutes{
        display: grid;
        grid-gap: 1px;
        grid-template-columns: repeat(6, 1fr);
        text-align: right;
        background-color: var(--line-color);
      }
      .hours>*, .minutes>* {
        background-color: var(--app-accent-color);
        cursor: pointer;
      }
      .unset {
        display: flex;
        flex-direction: row;
        justify-content: center;
        padding: 4px;
        border-top: 2px solid white;
      }
      .unset button {

        width: 70px;
      }

    </style>
    <div class="input" @click=${this._show}>
      <date-format .date=${this.value}  .withTime=${this.withTime}></date-format><material-icon>date_range</material-icon>
    </div>

    <app-overlay id="picker" @overlay-closed=${this._closing}>
      <div class="container">
        <div class="datepanel">
          <material-icon class="prev" @click=${this._previousMonth}>navigate_before</material-icon>
          <div class="month"><span>${this.month}</span>  <span>${this.year}</span></div>
          <material-icon class="next" @click=${this._nextMonth}>navigate_next</material-icon>
            ${guard([weekdays],() => weekdays.map(day => html`<div class="wd">[${day}]</div>`))}
            ${guard([this.dayGuard, this.month],() => this.weeks.map(week => week.map(day => html`
              <div class="day ${classMap({
                  inmonth: day.inMonth, 
                  selected:  day.today 
                })}" data-date="${day.date}" @click=${this._selectDay}>${day.day}</div> 
            `)))}      
        </div>
        ${cache(this.withTime? html`
          <div class="timepanel">
            <div class="am ${classMap({ selected: !this.pm })}" @click=${this._selectAm}>am</div>
            <div class="pm ${classMap({ selected: this.pm })}" @click=${this._selectPm}>pm</div>
            <div class="hr">Hr</div><div class="mi">Mi</div>
            <div class="hours">
              ${guard([this.hourGuard, hours], () => hours.map(h => html`
                <div class="hour ${classMap({
                  selected: this.value !== 0 && this.pm? h.offset + 12 : h.offset === dvalue.getHours() 
                })}" data-hour=${h.offset} @click=${this._selectHour}>${h.hour}</div>
              `))}
            </div>
            <div class="minutes">
              ${guard([this.minuteGuard, mins], () => mins.map(m => html`
                <div class="minute ${classMap({
                  selected: this.value !== 0 && Math.floor(dValue.getMinutes()/5) === m.offset
                })}" data-minute=${m.offset} @click=${this._selectMinute}>${m.min}</div>
              `))}      
            </div>
          </div>
        `:'')}
        <div class="unset">
          <button cancel @click=${this._unset}>${this.value === 0? (this.setZero? 'Restore' : 'Today') : 'Unset'}</button>
        </div>
      </div>
    </app-overlay>
    `;
  }

  validate() {
    return this.value !== 0;  //not sure about this - might need to always return true
  }
  _closing(e) {
    e.stopPropagation();
    this.dispatchEvent(new ValueChanged(this.value)); //tell the outside world we have a value
  }
  _nextMonth(e) {
    e.stopPropagation();
    const d = new Date();
    d.setTime(this.value * 1000);
    const td = d.getDate();  //save the day of the month
    d.setMonth(d.getMonth() + 1);
    const nd = d.getDate();
    if (td !== nd) {
      //this means that the month we have moved to is shorter than the current month so we probably jumped two months
      d.setDate(-1); //so switch us to last date of previous month
    }
    this.value = Math.floor(d.getTime()/1000);
  }
  _previousMonth(e) {
    e.stopPropagation();
    const d = new Date();
    d.setTime(this.value * 1000);
    const td = d.getDate();
    d.setMonth(d.getMonth() - 1)
    const pd = d.getDate();
    if (td !== pd) {
      //we moved back to a shorter month so jump back to current month
      d.setDate(-1); //so switch to last date of previous month
    }
  }
  _selectAm(e) {
    e.stopPropagation();
    if (this.pm) {
      //only do anything if currently pm is selected
      this.value = this.value - 43200; //switch to first half of day
      this.pm = false;
    }
  }
  _selectDay(e) {
    e.stopPropagation();
    const d = new Date();
    d.setTime(this.value * 1000);
    const nd = new Date();
    nd.setTime(e.currentTarget.dataset.date * 1000);
    nd.setHours(d.getHours());
    nd.setMinutes(d.getMinutes());
    this.value = Math.floor(nd.getTime() / 1000);
  }
  _selectHour(e) {
    e.stopPropagation();
    const d = new Date();
    d.setTime(this.value * 1000);
    const hrs = e.currentTarget.dataset.hour + this.pm? 12 : 0;
    d.setHours(hrs);
    this.value = Math.floor(d.getTime() / 1000);
  }
  _selectMinute(e) {
    e.stopPropagation();
    const d = new Date();
    d.setTime(this.value * 1000);
    d.setMinutes(e.currentTarget.dataset.minute * 5);
    this.value = Math.floor(d.getTime()/1000);
  }
  _selectPm() {
    if (!this.pm) {
      this.value = this.value + 43200; //switch to second half of day
      this.pm = true;
    }
  }
  _show() {
    this.overlay.show();
  }
  _unset() {
    if (this.value  === 0) {
      this.value = this.savedValue;
    } else {
      this.savedValue = this.value;
      this.value = 0;
      this.setZero = true;
    }
  }
}
customElements.define('calendar-input', CalendarInput);