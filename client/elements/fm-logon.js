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


import './fancy-input.js';
import './send-button.js';
import app from '../styles/app.js';
import button from '../styles/button.js';

/*
     <fm-logon>
*/
class FmLogon extends LitElement {
  static get styles() {
    return [app, button];
  }
  static get properties() {
    return {
      email: {type: String},
      password: {type: String},
      visited: {type: Boolean}
    };
  }
  constructor() {
    super();
    this.email = '';
    this.password = '';
    this.visited = false;


  }
  connectedCallback() {

    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.password = '';
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
        :host {
          display: flex;
          flex-direction:column;
          justify-content: flex-start;
          max-width: 600px;
          flex: 1;
        }
        header {
          height: var(--app-header-size);
          margin: 0 auto;
          padding: 0;
        }
        p {
          font-size: 1.3em;
        }
        #email {
          width: var(--email-input-length);
        }
        .action {
          display: flex;
          width:100%;
          flex-direction:row;
          justify-content: space-evenly;
        }


       @media (max-height: 1300px) {
          p {
            font-size:1em;
          }
 
        }
        @media (max-height: 1000px) {
          p {
            font-size: 0.7em;
          }
        }

        @media (max-height: 700px) {
          p {
            font-size: 0.5em;
          }
        }
 
 
        @media (max-height: 600px) {
          p {
            font-size: 0.45em;
          }
        }

        @media (max-width: 500px) {
          :host {
            justify-content: space-between;
          }
        }



      </style>
      <header><img src="../images/mb-logo.svg" height="64px"></header>
      ${this.visited ? '' : html`
        <section class="intro">
          <p>Welcome back to <strong>Melinda's Backups Football Results Picking Competition</strong>.  This 
          new version has been renamed <em>Football Mobile</em> and has been designed so you can use it on 
          your mobile phone if you wish. Sadly, with no forum available, you will be have to provide an 
          email address and password, but once you have we will use cookies with a special encrypted 
          token to help us remember you on this device.  By proceeding further you agree to this use of
          cookies.</p>
          <p>Also, in this first time through we will require you to verify
          your email address. We will send you a short lived link to take you to your profile page
          and set up a more permenant password.  <strong>Do Not</strong> try to log on if your e-mail has 
          changed since you last connected, enter your new e-mail address below and select
          the <strong>New Member</strong> option.</p>
          
          <p>If you have never taken part in one of our competitions, we don't have any record of you, please 
          enter your e-mail address and select the <strong>New Member</strong> option.</p>
          
          <p>This is not a public competition and you will require to be approved before being accepted. You will
          be given an oportunity to enter some brief explanation as to why you should be approved once your e-mail
          address has been verified</p>
        </section>
      `}
       <app-form id="logon" action="${this.visited?'/api/session/logon':'/api/session/verify'}" class="inputs" @keys-pressed="${this._sendData}">
        <fancy-input
          label="E-Mail"
          .message=${this.email.length > 0 ? 'Email Not Known' : 'Required'}
          autofocus
          autocomplete="off"
          required
          type="email"
          name="email"
          id="email"
          .value="${this.email}"
          @value-changed="${this._emChanged}"></fancy-input>
        ${this.visited? html`
          <fancy-input              
            label="Password"
            message="Password Incorrect"
            type="password"
            name="password"
            id="pw"
            .value="${this.password}"
            @value-changed="${this._pwChanged}"></fancy-input>
          <button id="forgotten" @click=${this._forgotten}>Forgotten Password</button>
        ` : ''}
      </app-form>
      <section class="action">          
        <button @click=${this._sendData}>Logon</button>
        <send-button @click=${this._newMember}>New Member</send-button>
      </section>
    `;
  }
  _emChanged() {
    this.email = e.changed;
  }
  _forgotten(e) {
    api('session/forgotten')
  }
  _newMember(e) {

  }
  _pwChanged(e) {
    this.password = e.changed;
  }
  _sendData() {

  }
}
customElements.define('fm-logon', FmLogon);