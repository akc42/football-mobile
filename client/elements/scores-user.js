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

import './football-page.js';
import './list-manager.js';
import './scores-user-item.js';

import page from '../styles/page.js';
import tooltip from '../styles/tooltip.js';
import { switchPath } from '../modules/utils.js';

/*
     <scores-user>
*/
class ScoresUser extends LitElement {
  static get styles() {
    return [page, tooltip];
  }
  static get properties() {
    return {
      user: {type: Object},
      rounds: {type: Array}
    };
  }
  constructor() {
    super();
    this.user = {uid:0,name:'', tscore:'',lscore:'',rscore:''};
    this.rounds = [];
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }

  render() {
    return html`
      <style>
      
        .container{
          border:2px solid var(--accent-color);
          box-shadow: 1px 1px 3px 0px var(--shadow-color);
          border-radius: 5px;
          margin:5px 5px 5px 3px;
          display: grid;
          grid-gap:2px;
          grid-template-columns: 3fr 2fr 1fr;
          grid-template-areas:
            "round mp mt"
            "round ou mt"
            "round bs rs";
        }
        .rn,.mp,.ou, .mt,.bs,.rs {
          padding:2px;
          background-color: var(--background-color);
          text-align: center;
          vertical-align: center;
        }
        .rn {
          grid-area:round;
        }

        .mp {
          grid-area:mp;
        }
        .ou {
          grid-area: ou;
        }
        .mt {
          grid-area:mt;
        }
        .bs {
          grid-area: bs;
        }
        .rs {
          grid-area: rs;
        }
        .poff {
          cursor:pointer;
        }

      </style>
      <football-page id="page" heading="User Scores">
        <div 
          slot="heading" 
          data-tooltip="click for playoff info" 
          @click=${this._playoff} 
          class="poff"><strong>${this.user.name}</strong></div>
        <div slot="heading">${this.user.rscore}:${this.user.lscore}:${this.user.tscore}</div>
        <list-manager custom="scores-user-item"  .items=${this.rounds}>
          <div class="container">
            <div class="rn">Round Name</div>
            <div class="mp">Match Picks</div>
            <div class="ou">Over Under</div>
            <div class="mt">Match Total</div>
            <div class="bs">Bonus Score</div>
            <div class="rs">Round Score</div>
          </div>
        </list-manager>
      </football-page>
    `;
  }
  _playoff(e) {
    e.stopPropagation();
    switchPath(`/teams/${this.user.uid}`);
  }
}
customElements.define('scores-user', ScoresUser);