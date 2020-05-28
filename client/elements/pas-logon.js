/*
    Copyright (c) 2015 Alan Chandler, all rights reserved

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

import { LitElement, html } from '../lit/lit-element.js';

import {setUser} from '../modules/user.js';
import PasKeys from '../modules/keys.js';

import app from '../styles/pas-app.js';

import './pas-form.js';
import './pas-waiting.js';
import './pas-icon.js';
import './pas-button.js';
import './pas-input.js';

export class PasLogon extends LitElement {
  static get styles() {
    return [
      app
    ];
  }
  static get properties() {
    return {
      un: {type: String},
      pw: {type: String},
      user: {type: Object},
      waiting: {type: Boolean},
      target: {type: Object},
      doneFirst: {type: Boolean},
    };
  }
  constructor() {
    super();
    this.un = '';
    this.pw = '';
    this.waiting = false;
    this.doneFirst = false;
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.keys !== undefined) this.keys.connect();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.keys.disconnect();
  }
  firstUpdated() {
    this.target = this.shadowRoot.querySelector('#logon');
    this.keys = new PasKeys(this.target, 'Enter');
    this.unInput = this.shadowRoot.querySelector('#un');
    this.pwInput = this.shadowRoot.querySelector('#pw');
    this.doLogon = this.shadowRoot.querySelector('#dologon');
  }
  render() {
    return html`
      <style>
        :host {
          display: flex;
          flex-direction: row;
          justify-content: center;
        }

        #logon {
          margin-top: 40px;
          max-width: 300px;
          padding: 10px;
        }
        pas-input {
          width: 170px;
        }
        .card-actions {
          margin-top: 10px;
          display: flex;
          flex-direction: row;
          justify-content: center;
          align-items: center;
        }
      </style>
      <pas-waiting ?waiting="${this.waiting}"></pas-waiting>
      <div id="logon" form-card @keys-pressed="${this._submitLogon}">
        <h3>User Log On</h3>
        <pas-form id="dologon" action="/logon" @pas-form-response="${this._formResponse}">
          <div class="card-content">
            <pas-input
              label="User Name"
              .message=${this.un.length > 0 ? 'User Name not known' : 'Required'}
              autofocus
              autocomplete="off"
              ?required=${this.doneFirst}
              name="name"
              id="un"
              .value="${this.un}"
              @blur=${this._doneFirst}
              @value-changed="${this._unChanged}"></pas-input>
            <pas-input
              label="Password"
              message="Password Incorrect"
              type="password"
              name="password"
              id="pw"
              @focus=${this._doneFirst}
              .value="${this.pw}"
              @value-changed="${this._pwChanged}"></pas-input>
          </div>
        </pas-form>
        <div class="card-actions">
          <pas-button @click="${this._submitLogon}"><pas-icon>check</pas-icon>Log On</pas-button>
        </div>
      </div>
    `;
  }
  _doneFirst() {
    this.doneFirst = true;
  }
  _formResponse(e) {
    e.stopPropagation();
    const response = e.detail;
    this.waiting = false;

    if (response.status) {
      //clear these down, as we may come back here after a log off.
      this.un = '';
      this.pw = '';
      setUser({  // set up our user
        name: response.name,
        logonname: response.logonname,
        displayName: response.displayName,
        uid: response.uid,
        keys: response.keys,
        session: response.session,
        nopass: (response.nopass) ? true : false
      });
      this.dispatchEvent(new CustomEvent('pas-auth-update',{
        bubbles: true,
        composed: true,
        detail: true
      }));
      if (response.nopass) {
        //If no password set yet for this user, we must go to that page next
        window.history.pushState({}, null, '/profile');
        window.dispatchEvent(new CustomEvent('location-changed'));
      }

    } else { // We had an error, so need to write an error label in the dialog
      if (!response.name) {
        this.pwInput.invalid = false;
        this.unInput.invalid = true;
        this.unInput.focus();
      } else {
        this.unInput.invalid = false;
        this.pwInput.invalid = true;
        this.pwInput.focus();
      }
    }
  }
  _pwChanged(e) {
    this.doneFirst = true;
    this.pw = e.target.value;
  }
  _submitLogon() {
    if (!this.waiting) {
      if (this.doLogon.validate()) {
        this.waiting = true;
        this.unInput.invalid = false;
        this.pwInput.invalid = false;
        this.doLogon.submit();
      }
    }
  }
  _unChanged(e) {
    this.doneFirst = true;
    this.un = e.target.value;
  }
}
customElements.define('pas-logon',PasLogon);
