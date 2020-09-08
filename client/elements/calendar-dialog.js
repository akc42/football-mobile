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
import {cache} from '../libs/cache.js';
import {classMap} from '../libs/class-map.js';
import {guard} from '../libs/guard.js';

import './dialog-box.js';

import domHost from '../modules/host.js';
import button from '../styles/button.js';

import { ValueChanged, CalendarReply } from '../modules/events.js';

const monthFormatter = Intl.DateTimeFormat('default', {
  month: 'long'
});
const weekdayFormatter = Intl.DateTimeFormat('default', {
  weekday: 'narrow'
})
//use 5 july 2020 3:0am local, sunday (near the beginning of the month, so 7 days later it is still the same month)
const weekdayMaker = new Date(2020,6,5,3,0,0);  //setting date like this uses local time.
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
class CalendarDialog extends LitElement {
  static get styles() {
    return [button, css`
 
`];
  }

  static get properties() {
    return {
      value: {type: Number}, //seconds since 1970 - provided by the outside
      name: {type: String, reflect: true},  //can be used in forms.
      month: {type: Number},
      year:{type:Number},
      monthName: {type: String},
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
    this.value = Math.floor(d.getTime()/1000);
    this.originalValue = this.value;
    this.savedValue = this.value;
    this.setZero = false;
    this.hourGuard = -2;
    this.dayGuard = -2;
    this.minuteGuard = -2;
    this.name = '';
    this.month = d.getMonth();
    this.year = d.getFullYear();
    this.monthName = monthFormatter.format(d);
    this.pm = false;
    this.weeks = [];
    this._gotRequest = this._gotRequest.bind(this);
    this.eventLocked = true;

  }
  connectedCallback() {
    super.connectedCallback();
    this.domHost = domHost(this);
    this.domHost.addEventListener('calendar-request', this._gotRequest);

  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.domHost.removeEventListener('calendar-request', this._gotRequest);
  }
  update(changed) {
    if (changed.has('month') || changed.has('year')) {
      const td = new Date();
      const dayMaker = new Date(this.year, this.month, 1, 0, 0, 0); //0 on 1st day of month
      this.monthName = monthFormatter.format(dayMaker);
      const day = dayMaker.getDay();
      dayMaker.setDate(1 - day);  //we are now at the first sunday
      this.weeks = [];
      
      for (let j = 0; j < 6; j++) { //we are always doing 6 weeks (otherwise calendar grows and shrinks annoyingly)
        const week = [];
        for (let i = 0; i < 7; i++) {

          week.push({
            date: (((dayMaker.getFullYear() * 100) + dayMaker.getMonth()) * 100) + dayMaker.getDate(),
            today: dayMaker.getFullYear() === td.getFullYear() && dayMaker.getMonth() === td.getMonth() &&
                    dayMaker.getDate() === td.getDate(),
            day: dayMaker.getDate(),
            inMonth: dayMaker.getFullYear() === this.year &&  dayMaker.getMonth() === this.month
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
    this.eventLocked = false;
  }
  updated(changed) {
    if (changed.has('value')) {
      if (this.value !== this.originalValue) {
        this.originalValue = this.value;
        this.overlay.positionTarget.dispatchEvent(new CalendarReply(this.value));
      }
      if (this.value !== 0) {
        const d = new Date();
        d.setTime(this.value * 1000);
        this.monthName = monthFormatter.format(d);
        this.year = d.getFullYear();
        this.month = d.getMonth();
        this.hourGuard = d.getHours();
        this.minuteGuard =  Math.floor(d.getMinutes()/5);
        this.dayGuard = (((this.year * 100) + this.month) * 100) + d.getDate();
        this.pm = d.getHours() >= 12;
      } else {
        this.dayGuard = -1;
        this.hourGuard = -1;
        this.minuteGuard = -1;
        this.pm = false;
      }
    }
    super.updated(changed);
  }
  render() {
    return html`
    <style>
  :host {
    --icon-size:20px;
  }

  .container {
    padding: 5px;
    box-shadow: 2px 2px 6px 0px var(--shadow-color);
    border-radius: 4px;
    width: 160px;
  }
  .datepanel {
    display: grid;
    grid-gap: 1px;
    grid-template-columns: repeat(7, 1fr);
    --icon-size: 16px;
    text-align: right;
    margin: 2px 0;
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
      ". am am am pm pm pm"
      "hr hp hp hp hp hp hp"
      "hr  hp hp hp hp hp hp"
      "mi mn mn mn mn mn mn"
      "mi mn mn mn mn mn mn";
    border-top: 2px solid white;
    margin: 2px 0;

  }
  .datepanel>*, .timepanel>* {
    background-color: var(--background-color);
    color: var(--color);
    box-sizing:border-box;
    height:20px;
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
  .am, .pm, .hr, .mi , .month, .prev,.next, .day.today {
    color: #cf0;
  }
  .day.selected, .day.inmonth.selected , .am.selected, .pm.selected, .hour.selected, .minute.selected {
    color: red;
    border:1px solid red;
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
    height: 41px;
  }
  .mi {
    grid-area: mi;
    height:41px;
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
    background-color: var(--dialog-color);

    height: 41px;
  }
  .hours>*, .minutes>* {
    cursor: pointer;
    box-sizing:border-box;
    height: 20px;
    background-color: var(--background-color);
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
    <dialog-box id="picker" @overlay-closed=${this._closing}>
      <div class="container">
        <div class="datepanel">
          <material-icon class="prev" @click=${this._previousMonth}>navigate_before</material-icon>
          <div class="month"><span>${this.monthName}</span>  <span>${this.year}</span></div>
          <material-icon class="next" @click=${this._nextMonth}>navigate_next</material-icon>
            ${guard([weekdays],() => weekdays.map(day => html`<div class="wd">${day}</div>`))}
            ${guard([this.dayGuard, this.month],() => this.weeks.map(week => week.map(day => html`
              <div class="day ${classMap({
                  inmonth: day.inMonth, 
                  selected:  day.date === this.dayGuard,
                  today: day.today
                })}" data-date="${day.date}" @click=${this._selectDay}>${day.day}</div> 
            `)))}      
        </div>
        ${cache(this.withTime? html`
          <div class="timepanel">
            <div class="am ${classMap({ selected: this.value !==0 && !this.pm })}" @click=${this._selectAm}>am</div>
            <div class="pm ${classMap({ selected: this.value !== 0 && this.pm })}" @click=${this._selectPm}>pm</div>
            <div class="hr">Hr</div><div class="mi">Mi</div>
            <div class="hours">
              ${guard([this.hourGuard, hours], () => hours.map(h => html`
                <div class="hour ${classMap({
                  selected: this.value !== 0 && (this.pm? h.offset + 12 : h.offset) === this.hourGuard 
                })}" data-hour=${h.offset} @click=${this._selectHour}>${h.hour}</div>
              `))}
            </div>
            <div class="minutes">
              ${guard([this.minuteGuard, mins], () => mins.map(m => html`
                <div class="minute ${classMap({
                  selected: this.value !== 0 && m.offset === this.minuteGuard
                })}" data-minute=${m.offset} @click=${this._selectMinute}>${m.min}</div>
              `))}      
            </div>
            <div></div>
          </div>
        `:'')}
        <div class="unset">
          <button cancel @click=${this._unset}>${this.value === 0? (this.setZero? 'Restore' : 'Today') : 'Unset'}</button>
        </div>
      </div>
    </dialog-box>
    `;
  }


  _closing(e) {
    e.stopPropagation();
    this.overlay.positionTarget.dispatchEvent(new ValueChanged(this.value)); //tell the outside world we have a value
    this.eventLocked = false;
  }
  _gotRequest(e) {
    e.stopPropagation();
    if (this.eventLocked) return;
    this.eventLocked = true;
    this.overlay.positionTarget = e.composedPath()[0];
    this.original = e.date.date;
    this.value = e.date.date;
    this.withTime = e.date.time;
    this.overlay.show();
  }
  _nextMonth(e) {
    e.stopPropagation();
    this.month++;
    if (this.month >= 12) {
      this.year++;
      this.month = 0;
    }
  }
  _previousMonth(e) {
    e.stopPropagation();
    this.month--;
    if (this.month < 0) {
      this.year--;
      this.month = 11;
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
    let nd = parseInt(e.currentTarget.dataset.date,10);
    d.setDate(nd % 100);
    nd = Math.floor(nd/100);
    d.setMonth(nd % 100);
    nd = Math.floor(nd/100);
    d.setFullYear(nd);
    this.value = Math.floor(d.getTime() / 1000);
  }
  _selectHour(e) {
    e.stopPropagation();
    const d = new Date();
    d.setTime(this.value * 1000);
    const hrs = parseInt(e.currentTarget.dataset.hour,10) + (this.pm? 12 : 0);
    d.setHours(hrs);
    this.value = Math.floor(d.getTime() / 1000);
  }
  _selectMinute(e) {
    e.stopPropagation();
    const d = new Date();
    d.setTime(this.value * 1000);
    d.setMinutes(parseInt(e.currentTarget.dataset.minute,10) * 5);
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
customElements.define('calendar-dialog', CalendarDialog);