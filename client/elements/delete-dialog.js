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

import './dialog-box.js';

import domHost from '../modules/host.js';
import { DeleteReply } from '../modules/events.js';
import button from '../styles/button.js';




/*
     <comment-dialog>
*/
class DeleteDialog extends LitElement {
  static get styles() {
    return [button,css``];
  }
  static get properties() {
    return {
      item: {type: String}
    };
  }
  constructor() {
    super();
    this.comment = '';
    this._gotRequest = this._gotRequest.bind(this);
    this.eventLocked = true;
  }
  connectedCallback() {
    super.connectedCallback();
    this.domHost = domHost(this);
    this.domHost.addEventListener('delete-request', this._gotRequest);
    
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.domHost.removeEventListener('delete-request', this._gotRequest);
  }
  update(changed) {
    super.update(changed);
  }
  firstUpdated() {
    this.dialog = this.shadowRoot.querySelector('#diag');
    this.eventLocked = false;
  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`
      <style>
        .container {
          background-color: var(--background-color);
          color: var(--color);
          display: flex;
          flex-direction: column;
          border: none;
          padding: 5px;
          border-radius:5px;
          box-shadow: 2px 2px 5px 4px var(--shadow-color);
        }
        .explain {
          margin: 10px;
        }
        .buttons {
          display: flex;
          flex-direction: row;
          justify-content: space-evenly;
        }
      </style>
      <dialog-box id="diag" position="top" @overlay-closed=${this._dialogClosed}>
        <div class="container">
          <div class="explain">Please confirm that you wish to delete ${this.item}</div>
          <div class="buttons">
            <button cancel @click=${this._cancel}>Cancel</button>
            <button @click=${this._replyToCaller}>Confirm</button>
          </div>
        </div>
      </dialog-box>

    `;
  }
  _cancel(e) {
    e.stopPropagation();
    this.dialog.close();
  }

  _dialogClosed(e) {
    this.eventLocked = false;
  }

  _gotRequest(e) {
    e.stopPropagation();
    if (this.eventLocked) return;
    this.eventLocked = true;
    this.dialog.positionTarget = e.composedPath()[0];
    this.item = e.item;
    this.dialog.show();
  }
  _replyToCaller(e) {
    e.stopPropagation();
    this.dialog.positionTarget.dispatchEvent(new DeleteReply());
    this.dialog.close();

  }
}
customElements.define('delete-dialog', DeleteDialog);