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
import './app-overlay.js';

/*
     <fm-comment-dialog>
*/
class FmCommentDialog extends LitElement {
  static get styles() {
    return [];
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
    this.dialog = this.shadowRoot.querySelector('#dialog');
  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`
    <app-overlay close-on-click id="dialog">
      <p>Not Implemented Yet</p>
    </app-overlay>
    `;
  }
  show() {
    if (this.dialog) this.dialog.show();
  }
}
customElements.define('fm-comment-dialog', FmCommentDialog);