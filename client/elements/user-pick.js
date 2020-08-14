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
import { LitElement, html , css} from '../libs/lit-element.js';
import {cache} from '../libs/cache.js';
import {classMap} from '../libs/class-map.js';

import './material-icon.js';

/*
     <user-pick>
*/
class UserPick extends LitElement {
  static get styles() {
    return css`
      .unknown {
        color: var(--fm-indeterminate-pick);
      }
      .correct {
        color: var(--fm-correct-pick);
      }
      .incorrect {
        color: var(--fm-incorrect-pick);
      }
    `;
  }
  static get properties() {
    return {
      admin: {type: Boolean}, //admin made the pick
      correct: {type: Boolean}, //the pick is correct (only valid if result is true)
      deadline: {type: Number}, //the deadline for this pick; (seconds since 1970)
      made: {type:Number}, //the pick made time (in seconds since 1970)
      result: {type: Boolean} //the result is available
    };
  }
  constructor() {
    super();
    this.admin = false;
    this.correct = false;
    this.deadline = 0;
    this.made = 0;
    this.result = false;
  }

  render() {
    return html`
  
      <material-icon 
        ?outlined=${!(this.result && this.correct)}
        class=${classMap({
          unknown: !this.result,
          correct: this.result & this.correct,
          incorrect: this.result && !this.correct
        })}>${this.made > this.deadline ? 'alarm_on': this.admin?'offline_pin':'check_circle'}</material-icon>
    `;
  }
}
customElements.define('user-pick', UserPick);