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
import emoji from '../styles/emoji.js';
/*
     <comment-panel>
*/
class CommentPanel extends LitElement {
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
      <dialog-box id="diag" position="target" @overlay-closed=${this._dialogClosed}>
        <div class="emoji">${this.comment}</div>
      </dialog-box>

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
    this.comment = e.comment;
    this.dialog.show();
  }
  _inputChanged(e) {
    e.stopPropagation();
    this.comment = e.changed;
  }

}
customElements.define('comment-panel', CommentPanel);