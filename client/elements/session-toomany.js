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

import page from '../styles/page.js';

import { SessionStatus } from '../modules/events.js';

import global from '../modules/globals.js';

import './fm-page.js';





/*
     <Session expired>: Displays an Error Message when A Pin token has expired.
*/
class SessionToomany extends LitElement {
  static get styles() {
    return [ page];
  }

  render() {
    return html`

      <fm-page heading="Too Frequent">      
        <p>Unfortunately you are requesting memberships for new e-mail addresses too frequently. Your last request has been rejected.</p> 
        <p>There is a limit of one request every ${global.membershipRate} minutes, with no more than ${global.maxMembership} requests per month.  If you have a legitimate reason to request more than this limit send an email to the <a href="mailto:${global.webmaster}">webmaster (${global.webmaster})</a> with your request.</p>
      </fm-page>
    `;
  }

}
customElements.define('session-toomany', SessionToomany);