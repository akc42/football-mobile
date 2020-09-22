/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file is part of Foorball Mobile.

    Foorball Mobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Foorball Mobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Foorball Mobile.  If not, see <http://www.gnu.org/licenses/>.
*/
import { LitElement, html } from '../libs/lit-element.js';
import global from '../modules/globals.js';

import './fm-page.js';
import page from '../styles/page.js';

/*
     <session-pin>
*/
class SessionPin extends LitElement {
  static get styles() {
    return [page];
  }
  static get properties() {
    return {
      email: {type: String}
    };
  }
  constructor() {
    super();
    this.email = '';

  }

  render() {
    return html`
      <fm-page heading="Membership Request">
        <p>You have been sent an email (to <strong>${this.email}</strong>) which contains a link to enable you to proceed.  This link has to be used within ${global.verifyExpires} hours from now, and once used cannot be used again.</p>
        <p>If you do not receive it, or are unable to use it within the alotted time, you may request another one, but please be aware that there must be at least ${global.membershipRate} minutes between each request, and no more than ${global.maxMembership} requests a month.</p>
      </fm-page>
    `;
  }
}
customElements.define('session-pin', SessionPin);