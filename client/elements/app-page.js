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
import app from '../styles/app.js';

import notice from '../styles/app-page.js';
import config from '../modules/config.js';
/*
     <app-page>
*/
class AppPage extends LitElement {
  static get styles() {
    return [app,notice];
  }
  static get properties() {
    return {
      siteLogo: {type: String}
    };
  }
  constructor() {
    super();
    this.siteLogo = '/appimages/site-logo.png';
    config().then(conf => this.siteLogo = conf.siteLogo);
  }

  render() {
    return html`
      <header><img src="${this.siteLogo}" height="64px"></header>
      <slot></slot>
      <slot class="action" name="action"></slot>
    `;
  }
}
customElements.define('app-page', AppPage);