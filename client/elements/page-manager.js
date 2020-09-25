/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file provided as part of Football-Mobile

    Page Manager is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Page Manager is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Page Manager.  If not, see <http://www.gnu.org/licenses/>.
*/


import { html } from '../libs/lit-element.js';
import {cache} from '../libs/cache.js';

import {connectUrl, disconnectUrl} from '../modules/location.js';

import RouteManager from './route-manager.js';
import Route from '../modules/route.js';


import global from '../modules/globals.js';

import page from '../styles/page.js';
import './comment-dialog.js';
import './comment-panel.js';
import './delete-dialog.js';

import { MenuRemove,MenuReset, WaitRequest } from '../modules/events.js';
import { switchPath } from '../modules/utils.js';

export class PageManager extends RouteManager {
  static get styles() {
    return [page];
  }
  static get properties() {
    return {
      authorised: {type: Boolean}
    }
  }
  constructor() {
    super();
    this.authorised = false;
    this.cidRouter = new Route('/:cid');
  }

  connectedCallback() {
    super.connectedCallback();
    connectUrl(route => {
      if (this.authorised) {
        const cidR = this.cidRouter.routeChange(route);
        if (Number.isInteger(cidR.params.cid) && cidR.params.cid > 0 && cidR.params.cid <= global.lcid) {
          //seems like a legitimate request
          global.cid = cidR.params.cid;
          this.route = cidR;
        } else {
          /*
            some urls, don't need a cid, they are /,  /profile, /navref and /icon plus /admhelp /gadm and its sub pages
          */
          if (cidR.params.cid === '' || cidR.params.cid === 'profile' || 
            cidR.params.cid === 'navref' || cidR.params.cid === 'help' || cidR.params.cid === 'admhelp' || 
              cidR.params.cid === 'gadm' ) {
            this.route = route; //just pass straight through
          } else {
            if (global.cid === 0) global.cid = global.lcid;
            switchPath(`/${global.cid}${route.path}`); //extend our path to include the cid.
          }
        }
      }
    });
    this.removeAttribute('unresolved');
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    disconnectUrl();
  }


  render() {
    return html`
      <comment-dialog></comment-dialog>
      <comment-panel></comment-panel>
      <delete-dialog ></delete-dialog>
     

      ${cache({
        admhelp: html`<admhelp-manager managed-page></admhelp-manager>`,
        admin: html`<admin-manager managed-page .route=${this.subRoute}></admin-manager>`,
        approve: html`<approve-manager managed-page .route=${this.subRoute}></approve-manager>`,
        gadm: html`<gadm-manager managed-page .route=${this.subRoute}></gadm-manager>`,
        home:html`<home-manager managed-page></home-manager>`,
        icon: html`<icon-manager managed-page></icon-manager>`,
        navref: html`<navref-manager managed-page></navref-manager>`,
        profile: html`<profile-manager managed-page></profile-manager>`,
        register: html`<register-manager managed-page></register-manager>`,
        rounds: html`<rounds-manager managed-page .roundRoute=${this.subRoute}></rounds-manager>`,
        soon: html`<soon-manager managed-page></soon-manager>`,
        scores: html`<scores-manager managed-page .route=${this.subRoute}></scores-manager>`,
        teams: html`<teams-manager managed-page .route=${this.subRoute}></teams-manager>`
      }[this.page])}

    `;
  }

  loadPage(page) {
    this.dispatchEvent(new WaitRequest(true));
    import(`./${page}-manager.js`).then(() => this.dispatchEvent(new WaitRequest(false)));
    this.dispatchEvent(new MenuReset(true));
    this.dispatchEvent(new MenuRemove(page));

   }

}
customElements.define('page-manager',PageManager);
