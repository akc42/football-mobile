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
import domHost from '../modules/host.js';
import {EmojiSelect, EmojiClosed} from'../modules/events.js';
import './dialog-box.js';

/*
     <emoji-dialog>
*/
class EmojiDialog extends LitElement {
  static get styles() {
    return css`
    #diag {
      background-color: var(--background-color);
      color: var(--color);      
    }
    .panel {
      width: 12rem;
      font-family:'Roboto Mono', monospace;
      background-color: var(--background-color);
      color: var(--emoji-color);
      font-weight: bold;
    }
    .panel span {
      cursor: pointer;
    }`;
  }

  constructor() {
    super();
    this._gotRequest = this._gotRequest.bind(this);
    this.eventLocked = true;
  }
  connectedCallback() {
    super.connectedCallback();
    this.domHost = domHost(this);
    this.domHost.addEventListener('emoji-request', this._gotRequest);

  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.domHost.removeEventListener('emoji-request', this._gotRequest);
  }

  firstUpdated() {
    this.dialog = this.shadowRoot.querySelector('#diag');
    this.eventLocked = false;
  }

  render() {
    return html`

      <dialog-box id="diag" position="target" @overlay-closed=${this._dialogClosed}>

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
      </dialog-box>
    `;
  }

  _dialogClosed(e) {
    if (this.eventLocked) {
      this.eventLocked = false;
      this.dialog.positionTarget.dispatchEvent(new EmojiClosed());
    }
  }

  _gotRequest(e) {
    e.stopPropagation();
    if (this.eventLocked) return;
    this.eventLocked = true;
    this.dialog.positionTarget = e.composedPath()[0];
    this.dialog.show();
  }
  _getChar(e) {
    e.stopPropagation();
    if(!this.eventLocked) return; //not running so ignore
    const c = e.target.innerText;
    this.dialog.positionTarget.dispatchEvent(new EmojiSelect(c));
  }
}
customElements.define('emoji-dialog', EmojiDialog);