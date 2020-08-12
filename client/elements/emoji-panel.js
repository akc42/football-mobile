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

import {EmojiSelect} from'../modules/events.js';

/*
     <emoji-panel>
*/
class EmojiPanel extends LitElement {
  static get styles() {
    return css`
    .panel {
      width: 12rem;
      font-family:'NotoColorEmoji', 'Roboto Mono', monospace;
    }
    .panel span {
      cursor: pointer;
    }`;
  }
  static get properties() {
    return {
    
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
      <style>
        
      </style>
      <div class="panel">
        <span @click=${this._getChar}>🍌</span>
        <span @click=${this._getChar}>🙇</span>
        <span @click=${this._getChar}>😖</span>
        <span @click=${this._getChar}>👋</span>
        <span @click=${this._getChar}>🐒</span>
        <span @click=${this._getChar}>🥂</span>
        <span @click=${this._getChar}>😢</span>
        <span @click=${this._getChar}>🤔</span>
        <span @click=${this._getChar}>😠</span>
        <span @click=${this._getChar}>🤩</span>
        <span @click=${this._getChar}>🙄</span>          
        <span @click=${this._getChar}>🥺</span>
        <span @click=${this._getChar}>👐</span>
        <span @click=${this._getChar}>😉</span>
        <span @click=${this._getChar}>😠</span>
        <span @click=${this._getChar}>🤯</span>
        <span @click=${this._getChar}>🥒</span>
        <span @click=${this._getChar}>😾</span>
        <span @click=${this._getChar}>🤣</span>
        <span @click=${this._getChar}>😈</span>
        <span @click=${this._getChar}>😮</span>
        <span @click=${this._getChar}>🙏</span>
        <span @click=${this._getChar}>👍</span>
        <span @click=${this._getChar}>❤️</span>
        <span @click=${this._getChar}>😱</span>
        <span @click=${this._getChar}>🛌</span>
                
      </div>
    `;
  }
  _getChar(e) {
    e.stopPropagation();
    const c = e.target.innerText;
    this.dispatchEvent(new EmojiSelect(c));
  }
}
customElements.define('emoji-panel', EmojiPanel);