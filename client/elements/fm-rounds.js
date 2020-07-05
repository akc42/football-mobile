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
import { html, LitElement } from '../libs/lit-element.js';
import {cache} from '../libs/cache.js';
import Route from '../modules/route.js';
import './app-page.js';
import page from '../styles/page.js';

/*
     <fm-Rounds>: A Page to allow user to make pics
*/

class FmRounds extends LitElement {
    static get styles() {
      return [page];
    }
  
  static get properties() {
    return {
      route: {type: Object}
    };
  }
  constructor() {
    super();
    this.route = {active: false};
    this.uRouter = new Route('/:uid', 'page: rounds');
  }
  update(changed) {
    if (changed.has('route')) {
      if (this.route.active) {

        const uRoute = this.uRouter.routeChange(this.route);

      }
    }
    super.update(changed);
  }

  render() {
    return html`
    <app-page heading="Rounds">
      <p>Still to Implement</p>
    </app-page>
    `;
  }
  
}
customElements.define('fm-rounds', FmRounds);