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

import './material-icon.js';
import { EmojiRequest } from '../modules/events.js';

/*
     <emoji-button>
*/
class EmojiButton extends LitElement {
  static get styles() {
    return css`
        :host {
          --icon-size: 16px;
          display: flex;
          height: 16px;
          width:16px;
          cursor:pointer;
        }
        material-icon {
          color: var(--emoji-button-color);
        }
    `;
  }
  static get properties() {
    return {
      target: {type: Object}
    };
  }

  render() {
    return html`
      <style>

      </style>

      <material-icon 
        @click=${this._display}>insert_emoticon</material-icon>

    `;
  }
  _display(e) {
    e.stopPropagation();
    if (this.target !== undefined) this.target.dispatchEvent(new EmojiRequest());
  }
}
customElements.define('emoji-button', EmojiButton);