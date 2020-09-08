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

import activeElement from '../modules/activeElement.js';
import { OverlayClosing, OverlayClosed } from '../modules/events.js';


class DialogBox extends LitElement  {
  static get styles() {
    return css`   

      :host {
        display:block;
      }
      #dialog {
        position: fixed;
        background-color: var(--dialog-color);
        color:  black;
        margin:5px;
        box-sizing: border-box;
        border: none;
        border-radius: 5px;
        box-shadow: 0 0 40px var(--shadow-color), 0 0 10px var(--shadow-color);
        padding: 0;
        display: none;
        opacity:0;
      }
      #dialog[open] {
        display:block;
        opacity: 1;
      }
    `;
  }

  static get properties() {
    return {
      //close if use clicks in the overlay (unless propagation prevented)
      closeOnClick: {type: Boolean},
      /**
       * position the sizingTarget according to the string.  Possible Values are
       *
       *  'target'  look for a "positionTarget" object and fit it near that
       *  'right'   look for a "positionTarget" onject and try and fit just to the right of it, matching tops if possible.
       *  'centre'  centre the item in the "fitInto" element
       *  'bottom'  align to the bottom center of the fitInto element
       *  'top'     align to the to centre of the fitInto element (but a this.topOffset Down)
       */
      position: { type: String },
      /*
       * percentage (between 1 and 100) of the maximum size of the sizing element against
       * ths object it is fitting into.
       */
      maxSize: { type: Number },
      //Offset if position is top
      topOffset: { type: Number }

    };
  }
  constructor() {
    super();
    this.nativeDialog = !!window.HTMLDialogElement;  //store it so we can change it in testing later
    if (!this.nativeDialog) import('./dialog-polyfill.js');
    this.sizingTarget = this;
    this.fitInto = window;
    this.position = 'target';
    this.maxSize = 95;
    this.topOffset = 90;
    this.resizeInProgress = false;
    this.closeOnClick = false;
    this.clickPosition = null;
    this._clicked = this._clicked.bind(this);
    this._dialogClosed = this._dialogClosed.bind(this);
    this._cancelled = this._cancelled.bind(this);
    this._resize = this._resize.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._resize);
    if (this.sizingTarget) {
      this.sizingTarget.addEventListener('click', this._clicked);
      this.sizingTarget.addEventListener('close', this._dialogClosed);
      this.sizingTarget.addEventListener('cancel', this._cancelled);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._resize);
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
      ${cache(this.nativeDialog ? html`
        <dialog
          id="dialog">
          <slot @slotchange=${this._slotChange}></slot>
        </dialog>`
    : html`
        <dialog-polyfill
          id="dialog"
          ?open=${this.opened}>
          <slot @slotchange=${this._slotChange}></slot>
        </dialog-polyfill>`)}
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
  async fit() {
    if (this.nativeDialog) {
      this._resize();
    } else {
      await this.sizingTarget.updateComplete;
      this._fit();
    }
  }
  _fit() {
    let top;
    let left;
    let width;
    let height;

    //reset existing maxHeight and widthStyles before measuring again
    this.sizingTarget.style.height = null;
    this.sizingTarget.style.width = null;

    const sizingRect = this._getNormalizedRect(this.sizingTarget);
    const intoRect = this._getNormalizedRect(this.fitInto);
    width = sizingRect.width;
    height = sizingRect.height;
    if (width > (intoRect.width * this.maxSize / 100)) {
      width = (intoRect.width * this.maxSize / 100);
      this.sizingTarget.style.width = width.toString() + 'px';
    }
    if (height > (intoRect.height * this.maxSize / 100)) {
      height = (intoRect.height * this.maxSize / 100);
      this.sizingTarget.style.height = height.toString() + 'px';
    }

    if (this.position === 'centre') {
      left = (intoRect.right + intoRect.left - width) / 2;
      top = (intoRect.top + intoRect.bottom - height) / 2;
    } else if (this.position === 'bottom') {
      left = (intoRect.right + intoRect.left - width) / 2;
      top = intoRect.bottom - height;
    } else if (this.position === 'top') {
      left = (intoRect.right + intoRect.left - width) / 2;
      top = intoRect.top + this.topOffset; //allow margin at top
    } else {
      if (!this.positionTarget) {
        //We haven't got a position target so work out our parent (the default)
        this.positionTarget = this.parentNode;
        if (!this.positionTarget) return; //can't do anything without positionTarget
        //if parent is boundary (document fragment) then we need our host
        if (this.positionTarget.nodeType === 11) this.positionTarget = this.positionTarget.host;
      }
      const positionRect = this._getNormalizedRect(this.positionTarget);

      if (positionRect.right < intoRect.left) {
        //position target is off to the left, so we left align
        left = intoRect.left;
      } else if (positionRect.left > intoRect.right) {
        //position is off to the right, so we align right
        left = intoRect.right - width;
      } else if (this.position === 'right') {
        left = positionRect.right;  //ideally we would like to be here, but the right may push us in
        if (left + width > intoRect.right) left = intoRect.right - width;
      } else {
        // natural position will be aligned center to centre with target, but may alter later
        left = (positionRect.right + positionRect.left - width) / 2;
      }
      if (positionRect.bottom < intoRect.top) {
        //position is above top, so align to top
        top = intoRect.top;
      } else if (positionRect.top > intoRect.bottom) {
        //position below bottom so align to bottom
        top = intoRect.bottom - height;
      } else if (this.position === 'right') {
        if (positionRect.top < intoRect.top) {
          //the top of our positioning target is above the top of are limit, so adjust to the limit;
          top = intoRect.top
        } else if (positionRect.top + height > intoRect.bottom) {
          //our bottom would be below the button, so we need to come up a bit
          top = intoRect.bottom - height;
        } else {
          //ideally we align our tops
          top = positionRect.top;
        }
      } else {
        /*
          This is more complex we first try to align below our position target
        */
        if (positionRect.bottom + height <= intoRect.bottom) {
          //it fits below, so place it there
          top = positionRect.bottom;
          if (left < intoRect.left) {
            left = intoRect.left;
          } else if (left + width > intoRect.right) {
            left = intoRect.right - width;
          } // else left is fine where it is
        } else if (positionRect.top - height >= intoRect.top) {
          //it fits above position target, so place it there
          top = positionRect.top - height;
          if (left < intoRect.left) {
            left = intoRect.left;
          } else if (left + width > intoRect.right) {
            left = intoRect.right - width;
          } // else left is fine where it is
        } else if (positionRect.right + width <= intoRect.right) {
          //we fit to right of position target so place it there
          left = positionRect.right;
          top = intoRect.bottom - height;
        } else if (positionRect.left - width >= intoRect.left) {
          //we fit to the left of position target to place it there
          left = positionRect.left - width;
          top = intoRect.bottom - height;
        } else {
          //We are going to have to overlay our position target somewhat, so just place in bottom left corner
          left = intoRect.left;
          top = intoRect.bottom - height;
        }
      }
    }
    this.sizingTarget.style.top = top.toString() + 'px';
    this.sizingTarget.style.left = left.toString() + 'px';
  }
  _getNormalizedRect(target) {
    if (target === document.documentElement || target === window) {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        right: window.innerWidth,
        bottom: window.innerHeight
      };
    }
    return target.getBoundingClientRect();
  }
  _resize() {
    if (this.resizeInProgress) return;
    this.resizeInProgress = true;
    requestAnimationFrame(() => {
      //Do resize calc
      this._fit();
      this.resizeInProgress = false;
    });
  }

}
customElements.define('dialog-box', DialogBox);
