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

import page from '../styles/page.js';


/*
     <list-manager>
*/
class ListManager extends LitElement {
  static get styles() {
    return [page, css`
    :host {
      height: var(--list-height,100%);
    }

    #list {
      height: 100%;
    }

`];
  }
  static get properties() {
    return {
      items: {type: Array},    //at least uid and name fields in each entry
      custom: {type: String}
    };
  }
  constructor() {
    super();
    this.items = [];
    this.custom = '';
  }


  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`
      <style>
        #list > .item {
          scroll-snap-align:start;
          border-radius: 5px;
          box-shadow: 1px 1px 3px 0px var(--shadow-color);
          margin:0 5px 5px 3px;
        }

      </style>
     
      <header>
        <slot name="header"></slot>
      </header>
      <section id="list" class="scrollable">
        ${cache(this.items.map(item =>this._build(item)))}
      </section>
    `;
  }
  _build(item) {
    if (this.custom.length === 0) return;
    //This works really well to introduce a templated string which can then later be interpretted as an html templated string
    const strings = [`<div class="item"><${this.custom} .item=`, `></${this.custom}></div>`];
    return html(strings,item);
  } 
}
customElements.define('list-manager', ListManager);