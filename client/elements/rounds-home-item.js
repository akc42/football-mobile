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


import global from '../modules/globals.js';
import { UserSelected } from '../modules/events.js';

import './material-icon.js';
import './user-pick.js';
import './rounds-home-item.js';

/*
     <rounds-home-item>
*/
class RoundsHomeItem extends LitElement {
  static get styles() {
    return css``;
  }
  static get properties() {
    return {
      item: {type: Object}
    };
  }
  constructor() {
    super();
    this.item = {uid:0, name:'',rscore:'',lscore:'',tscore:''};
    this._select = this._select.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this._select);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this._select);
  }

  render() {
    return html`
      ${global.user.uid === this.item.uid? html`
        <style>
          :host {
            background-color: var(--accent-color); 
            border: 2px solid var(--accent-color);
          }
        </style>
      `:html`
        <style>
          :host {
            background-color: var(--secondary-color); 
            border: 2px solid var(--secondary-color);
          }
        </style>
        `}

      <style>
        :host {

          border-radius: 5px;
          display: grid;
          grid-gap: 2px;
          grid-template-columns: 2fr repeat(4,1fr);
          grid-template-areas:
            "un mr ou bn tl"
            "un pk pk op done";
          cursor:pointer;
        }
        .un, .mr, .ou, .bn, .tl, .pk, .op, .done {
          padding:2px;
          background-color: var(--background-color);
          text-align: center;
          vertical-align: center;
       
        }
        .un {
          grid-area:un;
        }

        .mr {
          grid-area:mr;
        }
        .ou {
          grid-area: ou;
        }
        .tl {
          grid-area:tl;
        }
        .pk {
          grid-area: pk;
        }
        .op {
          grid-area: op;
        }
        .done {
          grid-area: done;
          color: green;
        }
        .late {
          font-size: 8pt;
          font-weight: normal;
        }
        .support {
          color: red;
          font-weight: normal;
        }
      </style>
      <div class="un">${this.item.name}</div>
      <div class="mr">${this.item.pscore}</div>
      <div 
        class="ou" 
       >${this.item.ouRound ? this.item.oscore : ''}</div>
      <div 
        class="bn" 
       >${this.item.validQuestion ?this.item.bscore: ''}</div>
      <div class="tl">${this.item.score}</div>
      <div class="pk">
        ${cache(this.item.canPick?html`
          <material-icon>alarm</material-icon>
        `:html`
          ${this.item.wasLate ? html`<div class="late">L</div>` : (this.item.hadAdminSupport ? html`<div class="support">A</div>` : html`<div>&nbsp;</div>`)}

        `)}
      </div>
      <div class="op">
      ${cache(this.item.validQuestion ? html`
        ${cache(this.item.canOption ? html`
          <material-icon>alarm</material-icon>
        `: html`
          ${this.item.submit_time > this.item.deadline ? html`<div class="late">L</div>` : (this.item.admin_made === 1 ? html`<div class="support">A</div>` : '')} 
        `)}
      `:'')}
      </div>
      <div class="done">
        ${cache(this.item.doneAllPicks?html`<material-icon>check</material-icon>`:'')}
      </div>
    `;
  }
  _select(e) {
    e.stopPropagation();
    this.dispatchEvent(new UserSelected(this.item.uid));
  }
}
customElements.define('rounds-home-item', RoundsHomeItem);