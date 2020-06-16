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
import calendar from '../styles/calendar.js';



/*
     <app-calendar>
*/
class AppCalendar extends LitElement {
  static get styles() {
    return [calendar];
  }
  static get months() {
    return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  }
  static get properties() {
    return {
      date: {type: Number}, //seconds since 1970 - provided by the outside
      dateString: {type:String},
      month: {type: String},
      year:{type:String}

    };
  }
  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();
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
    <div class="time"><span>${this.dateString}</span><material-icon>date_range</material-icon></div>
    <app-overlay id="picker">
      <table>
        <caption>
          <material-icon @click=${this._previousMonth}>navigate_before</material-icon>
          <div><span class="month">${this.month}</span><material-icon>arrow_drop_down</material-icon></div>
          <div>
            <material-icon class="year">arrow_left</material-icon>
            <span class="year">${this.year}</span>
            <material-icon class="year">arrow_right</material-icon>
          </div>
          <material-icon @click=${this._nextMonth}>navigate_next</material-icon>
        </caption>
        <thead>
          <tr>
            <th>[S]</th>
            <th>[M]</th>
            <th>[T]</th>
            <th>[W]</th>
            <th>[T]</th>
            <th>[F]</th>
            <th>[S]</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          </tr>
          <tr>
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          </tr>
          <tr>
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          </tr>
          <tr>
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          </tr>
          <tr>
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          </tr>
          <tr>
            <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
          </tr>
        </tbody>
      </table>
      <hr/>
      <table>
        <tbody>
          <tr>
            <td></td><td></td><td class="ap am">am</td><td></td><td></td><td id="pm" class="ap pm">pm</td><td></td>
          </tr>
          <tr>
            <td class="hour">Hr</td><td class="firsthr">12</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td>
          </tr>
          <tr>
            <td></td><td class="secondhr">6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td>
          </tr>
        </tbody>
      </table>
      <table>
        <tbody>
          <tr>
            <td class="minute"></td><td class="firstmi">00</td><td>05</td><td>10</td><td>15</td><td>20</td><td>25</td>
          </tr>
          <tr>
            <td></td><td class="secondmi">30</td><td>35</td><td>40</td><td>45</td><td>50</td><td>55</td>
          </tr>
        </tbody>
      </table>
      <hr/>

      <button cancel @click=${this._unset}>Unset</button>
    </app-overlay>
    `;
  }
}
customElements.define('app-calendar', AppCalendar);