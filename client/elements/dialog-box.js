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

import Fit from '../modules/fit.js';
import activeElement from '../modules/activeElement.js';
import { OverlayClosing, OverlayClosed } from '../modules/events.js';


class DialogBox extends Fit(LitElement)  {
  static get styles() {
    return css`   
      #dialog {
        position: fixed;
        background-color: white;
        color:  black;
        margin:5px;
        box-sizing: border-box;
        border: none;
        border-radius: 5px;
        box-shadow: 0 0 40px rgba(0,0,0,0.1), 0 0 10px rgba(0,0,0,0.25);
        overflow-y: auto;
        padding: 0;
      }
    `;
  }

  static get properties() {
    return {
      //close if use clicks in the overlay (unless propagation prevented)
      closeOnClick: {type: Boolean}
    };
  }
  constructor() {
    super();
    this.closeOnClick = false;
    this.clickPosition = null;
    this._clicked = this._clicked.bind(this);
    this._dialogClosed = this._dialogClosed.bind(this);
    this._cancelled = this._cancelled.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.sizingTarget) {
      this.sizingTarget.addEventListener('click', this._clicked);
      this.sizingTarget.addEventListener('close', this._dialogClosed);
      this.sizingTarget.addEventListener('cancel', this._cancelled);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.sizingTarget.removeEventListener('click', this._clicked);
    this.sizingTarget.removeEventListener('close', this._dialogClosed);
    this.sizingTarget.removeEventListener('cancel', this._cancelled);

    if (this.opened) this.sizingTarget.close('cancel');
  }
  firstUpdated() {
    this.sizingTarget = this.shadowRoot.querySelector('#dialog');
    this.sizingTarget.addEventListener('click', this._clicked);
    this.sizingTarget.addEventListener('close', this._dialogClosed);
    this.sizingTarget.addEventListener('cancel', this._cancelled);
  }
  render() {
    return html`
      <style>
        :host {
          display: block;
        }

      </style>
      ${this.nativeDialog ? html`
        <dialog
          id="dialog">
          <slot @slotchange=${this._slotChange}></slot>
        </dialog>`
    : html`
        <dialog-polyfill
          id="dialog">
          <slot @slotchange=${this._slotChange}></slot>
        </dialog-polyfill>`}

    `;
  }
  get opened() {
    if (this.sizingTarget !== undefined) {
      return this.sizingTarget.open;
    }
    return false;
  }
  async close(reason) {
    if (reason !== 'testing') {
      this.closedPromise = new Promise(accept => this.closeResolver = accept);
      if (this.sizingTarget.open) {
        if (this.dispatchEvent(new OverlayClosing())) {
          //close if not prevented
          this.sizingTarget.close(reason || 'request');
        } else {
          this.closeResolver();
        }
      } else {
        this.closeResolver();
      }
      await this.closedPromise;
      delete this.closeResolver;
    } else {
      if (this.closeResolver !== undefined) await this.closedPromise;
    }
    if (this.activeElement !== undefined) {
      this.activeElement.focus();
      delete this.activeElement;
    }
  }
  show() {
    if (this.sizingTarget !== undefined) {
      if (!this.sizingTarget.open) {
        this.activeElement = activeElement(); //remember it so we can restore to it
        if (this.activeElement === null) delete this.activeElement;
        this.sizingTarget.showModal();
        this.fit();
      }
    }
  }
  _cancelled(e) {
    e.preventDefault();
    this.close('cancel');
  }
  _clicked(e) {
    e.stopPropagation();
    let needsClose = true;
    /*
      because the dialog (sizingTarget) is modal, clicking outside the box will always give
      the sizingTarget as the clicked element.  Clicking inside the box will mean the element is one of the
      elements that is in the slot.
    */
    if(e.target !== this.sizingTarget) {
      //click inside the dialog
      if (!this.closeOnClick) needsClose = false;
      this.clickPosition = null;
    } else {
      //We clicked outside the dialog, so record where it was
      this.clickPosition = {x: e.clientX, y: e.clientY};
    }
    if (needsClose) this.close('click');
  }
  _dialogClosed() {
    this.dispatchEvent(new OverlayClosed(this.sizingTarget.returnValue,this.clickPosition));
    if(this.closeResolver !== undefined) this.closeResolver();
  }
  _slotChange() {
    if (this.sizingTarget !== undefined && this.sizingTarget.open) this.fit();
  }
}
customElements.define('dialog-box', DialogBox);
