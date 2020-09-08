/**
    @licence
    Copyright (c) 2019 Alan Chandler, all rights reserved

    This file is part of PASv5, an implementation of the Patient Administration
    System used to support Accuvision's Laser Eye Clinics.

    PASv5 is licenced to Accuvision (and its successors in interest) free of royality payments
    and in perpetuity in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
    implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. Accuvision
    may modify, or employ an outside party to modify, any of the software provided that
    this modified software is only used as part of Accuvision's internal business processes.

    The software may be run on either Accuvision's own computers or on external computing
    facilities provided by a third party, provided that the software remains soley for use
    by Accuvision (or by potential or existing customers in interacting with Accuvision).
*/

import { LitElement, html } from '../libs/lit-element.js';

const initialZIndex = 10;

let openLayers = [];

class DialogPolyfill extends LitElement {
  static get properties() {
    return {
      returnValue: {type: String},
      open: {type: Boolean, reflect: true},
      role: {type: String, reflect: true}
    };
  }
  constructor() {
    super();
    this.returnValue = '';
    this.open = false;
    this.role =  'dialog';
    this.zIndex = 'auto';
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this._click);
    if (this.backdrop) this.backdrop.addEventListener('touchmove', this._touchMove);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this._click);
    this.backdrop.removeEventListener('touchmove', this._touchMove);
    if (this.open) {
      openLayers = openLayers.filter(value => value.dialog !== this); //remove ourselves from open array
      this.open = false;
    }
  }
  firstUpdated() {
    this.backdrop = this.shadowRoot.querySelector('#backdrop');
    this.dialog = this.shadowRoot.querySelector('#dialog');
    this.backdrop.addEventListener('touchmove', this._touchMove);
  }
  render() {
    return html`
      <style>
          :host:not([open]) {
            display: none!important;
          }
          :host[open] {
            display: block;
          }
          #backdrop {
            position: fixed;
            top: 0px;
            bottom: 0px;
            left: 0px;
            right: 0px;
            background: rgba(0,0,0,0.1);
            z-index: ${this.zIndex}
          }
          #dialog {
            position: fixed;
            background-color: var(--app-dialog-background-color, white);
            color: var(--app-dialog-text-color, --app-default-text, black);
            margin:5px;
            box-sizing: border-box;
            border: none;
            border-radius: 2px;
            box-shadow: 0 0 40px rgba(0,0,0,0.1), 0 0 10px rgba(0,0,0,0.25);
            padding: 1em;
          }
      </style>
      <div id="backdrop" tabindex="-1" role="none">
        <div id="dialog">
          <slot></slot>
          <div id="focusCatcher" tabindex="0"></div>
        </div>
      </div>`;
  }
  get style() {
    return this.dialog.style;
  }
  getBoundingClientRect() {
    return this.dialog.getBoundingClientRect();
  }
  close(value) {
    this.open = false;
    this.returnValue = value;
    openLayers = openLayers.filter(value => value.dialog !== this); //remove ourselves from open array
    this.dispatchEvent(new Event('close',{
      bubbles: false,
      cancelable: false
    }));
  }
  showModal() {
    this.open = true;
    this.zIndex = openLayers.length === 0? initialZIndex : (openLayers[0].zIndex + 1);
    openLayers.unshift({dialog:this, zIndex: this.zIndex});
    this.dialog.focus();
  }

  // As of Sep 2018 (according to elix component ModalBackdrop), Mobile Safari allows the user to drag on the backdrop to
  // scroll the page behind it, which violates the modality. To correct this,
  // we prevent touchmove events with one touch from performing the default
  // page scrolling.
  _touchMove(e) {
    if(e.touches.length === 1) e.preventDefault();
  }
}

customElements.define('dialog-polyfill',DialogPolyfill);


