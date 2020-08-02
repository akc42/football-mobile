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

import './dialog-box.js';
import domHost from '../modules/host.js';
import { CommentReply } from '../modules/events.js';

import emoji from '../styles/emoji.js';

/*
     <comment-dialog>
*/
class CommentDialog extends LitElement {
  static get styles() {
    return [emoji];
  }
  static get properties() {
    return {
      comment: {type: String}
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
    this.domHost.addEventListener('comment-request', this._gotRequest);
    
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.domHost.removeEventListener('comment-request', this._gotRequest);
  }
  update(changed) {
    super.update(changed);
  }
  firstUpdated() {
    this.dialog = this.shadowRoot.querySelector('#diag');
  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`
      <style>
      
      </style>
      <app-overlay id="diag" position="target" @overlay-closed=${this._dialogClosed}>
        <textarea id="comment" class="emoji">${this.comment}</textarea>

        <button @click=${this._replyToCaller}>Save</button>

      </app-overlay>

    `;
  }


  _dialogClosed(e) {
    this.eventLocked = false;
  }

  _gotRequest(e) {
    e.stopPropagation();
    if (this.eventLocked) return;
    this.eventLocked = true;
    this.dialog.positionTarget = e.composedPath()[0];
    this.original = e.comment;
    this.comment = e.comment;
    this.dialog.show();
  }
  _inputChanged(e) {
    e.stopPropagation();
    this.comment = e.changed;
  }
  _replyToCaller(e) {
    e.stopPropagation();
    if (this.original !== this.comment) {
      this.dialog.positionTarget.dispatchEvent(new CommentReply(this.comment));
    }
    this.dialog.close();

  }
}
customElements.define('comment-dialog', CommentDialog);