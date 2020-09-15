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
import { cache } from '../libs/cache.js';

import './fm-page.js';
import './material-icon.js';
import page from '../styles/page.js';

import api from '../modules/api.js';
import global from '../modules/globals.js';
import { switchPath } from '../modules/utils.js';
import { WaitRequest } from '../modules/events.js';

/*
     <football-page>: fm-page extended with Slot "heading" for info for competition heading bar
*/
class FootballPage extends LitElement {
  static get styles() {
    return [ page, css`
      :host {
        height: 100%;
      }
      .competition {
        border:2px solid var(--accent-color);
        border-radius: 5px;
        box-shadow: 1px 1px 3px 0px var(--shadow-color);
        margin:3px;
        padding: 1px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;  
        align-items: center;     
      }

      #compname {
        font-weight: bold;
      }
      .pick {
        cursor: pointer;
      }
      .pick span {
        font-size: 0.7rem;
      }
      .pick material-icon {
        color:  var(--picks-available-color);
      }
      .pt {
        cursor: pointer;
      }
    
    `];
  }
  static get properties() {
    return {
      name: { type: String },
      heading: { type: String },
      nohead: {type: Boolean}, //Set if the subheading should not be set (because we are on the page already!)
      canPick: { type: Boolean },  //Flag to see picks
      next: {type: Number}, //Next cid or 0 if not one
      previous: {type: Number}, //Previous cid or 0 if not one.
    };
  }
  constructor() {
    super();
    this.name = ''; 
    this.next = 0;
    this.previous = 0;
    this.canPick = false;
    this.nohead = false;
  }
  connectedCallback() {
    super.connectedCallback();
    this.canPick = false;
    const check = global.lcid === global.cid
    this.dispatchEvent(new WaitRequest(true));
    api(`user/${global.cid}/fetch_comp_name`, { check: check }).then(response => {
      this.name = response.name;
      this.next = response.next;
      this.previous = response.previous;
      if (check) this.canPick = response.canpick;
      //this.dispatchEvent(new WaitRequest(false)); //bit naughty, but competion data to have been read
    });
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.name = '';
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
      <fm-page id="page" .heading="${this.heading}">
        ${cache(this.canPick && !this.nohead ? html`
         <div class="pick" slot="subheading" @click=${this._makePicks}><material-icon>create</material-icon> <span>PlayOff Picks<span></div>
        `: '')}
        <div class="competition">
          ${this.previous === 0 ? html`<div>&nbsp;</div>` : html`<material-icon class="pt" @click=${this._goPrevious}>arrow_back</material-icon>`}
          <div id="compname">${this.name}</div>
          ${this.next === 0 ? html`<div>&nbsp;</div>` : html`<material-icon class="pt" @click=${this._goNext}>arrow_forward</material-icon>`}
        </div>
        <slot name="heading"></slot>
        <slot></slot>       
        <slot slot="action" name="action"></slot>         
      </fm-page>
    `;
  }
  _goNext(e) {
    e.stopPropagation();
    global.cid = this.next;
    switchPath(`/${global.cid}`);
  }
  _goPrevious(e) {
    e.stopPropagation();
    global.cid = this.previous;
    switchPath(`/${global.cid}`);
  }
  _makePicks(e) {
    e.stopPropagation();
    switchPath(`/${global.cid}/teams/user`);
  }
}
customElements.define('football-page', FootballPage);