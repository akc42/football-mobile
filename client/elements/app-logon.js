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
import notice from '../styles/notice.js';
/*
     <app-logon>: Collects, username, password and notes forgotten password requests
*/
class AppLogon extends LitElement {
  static get styles() {
    return [app, button, notice];
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
        #email {
          width: var(--email-input-length);
        }
        p {
          font-size: 1.3em;
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



      </style>
      <header><img src="../images/mb-logo.svg" height="64px"></header>
      
        <section class="intro">

        </section>
     
       <app-form id="logon" action="/api/session/logon" class="inputs" @keys-pressed="${this._sendData}">
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
          <fancy-input              
            label="Password"
            message="Password Incorrect"
            type="password"
            name="password"
            id="pw"
            .value="${this.password}"
            @value-changed="${this._pwChanged}"></fancy-input>
          <div id="forgotten" @click=${this._forgotten}>Forgotten Password</div>
          <app-checkbox 
      </app-form>
      <section class="action">          
        <send-button @click=${this._sendData}>Log On</send-button>
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
customElements.define('app-logon', AppLogon);