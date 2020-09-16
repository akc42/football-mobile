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
import Route from '../modules/route.js';
import './fm-page.js';
import page from '../styles/page.js'

/*
     <approve-email>
*/
class ApproveEmail extends LitElement {
  static get styles() {
    return [page,css``];
  }
  static get properties() {
    return {
      route:{type: Object},
      uid: {type: Number}, //uid of member we want to send e-mail to
      members: {type:Array},
      member:{ type: Object}
    };
  }
  constructor() {
    super();
    this.route = {active: false};
    this.router = new Route(':uid','page:email');
    this.uid = 0;
    this.members = [];
    this.member = {uid: 0, email: '', reason: ''};
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    if (changed.has('uid') || changed.has('members')) {
      const member = this.members.find(m => m.uid === this.uid);
      if (member !== undefined) {
        this.member = member;
      }
    }
    super.update(changed);
  }
  firstUpdated() {
  }
  updated(changed) {
    if (changed.has('route') && this.route.active) {
      const memberR = this.router.routeChange(this.route);
      if (memberR.active) {
        this.uid = memberR.params.uid;
      }
    }
    super.updated(changed);
  }
  render() {
    return html`
      <style>
      </style>
      <fm-page heading="Email Member">
        <p>Still to be implemented = email to ${this.member.email}</p>
      </fm-page>
    `;
  }
}
customElements.define('approve-email', ApproveEmail);