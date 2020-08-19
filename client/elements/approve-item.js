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

import { RoundSelected } from '../modules/events.js';


/*
     <approve-item>: Single Member who is seeking approval
*/
class RoundsUserItem extends LitElement {
  static get styles() {
    return css`      
      :host {

        background-color: var(--app-primary-color);
        display: grid;
        grid-gap:2px;
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-areas:
          "user rs ps"
          "user ts ts";
      }
      .un,.rs,.ps,.ts {
        padding:2px;
        background-color: white;
        color:var(--app-primary-text);
        text-align: center;
        vertical-align: center;
        cursor:pointer;
      }
      .un {
        grid-area:user
      }

      .rs {
        grid-area:rs;
      }
      .ps {
        grid-area: ps;
      }
      .ts {
        grid-area:ts;
      }
      .me {
        background-color: var(--app-user-color);
        color: var(--app-user-text);
        font-weight: bold;
      }

    `;
  }
  static get properties() {
    return {
      item: {type: Object}
    };
  }
  constructor() {
    super();
    this.item = {uid: 0, name:'',email:'',reason:'', };
  }

  render() {
    return html`
      <style>
        :host {
          display:grid;
          grid-gap: 2px;
        }
      
      </style>
        <img class="aid-logo" src="/appimage/teams/${this.item.aid}.png"/>
        <div class="name">${this.item.aid}</div>
        <div class="result"> </div>
        <img class="hid-logo" src="/appimage/teams/${this.item.hid}.png"/>
      <div class="team hid">
      </div>
    `;
  }
  _select(e) {
    e.stopPropagation();
    this.dispatchEvent(new RoundSelected(this.item.rid));
  }
}
customElements.define('rounds-user-item', RoundsUserItem);