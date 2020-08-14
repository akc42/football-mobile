/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file is part of Football-Mobile.

    Football-Mobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Football-Mobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Football-Mobile.  If not, see <http://www.gnu.org/licenses/>.
*/
import { LitElement, html } from '../libs/lit-element.js';
import {cache} from '../libs/cache.js';
import global from '../modules/globals.js'; 
import {switchPath} from '../modules/utils.js';
import './error-manager.js';
import './dialog-box.js';
import './page-manager.js';
import './session-manager.js';
import './material-icon.js';

import tooltip from '../styles/tooltip.js';
import page from '../styles/page.js';

import { SessionStatus, PageClose } from '../modules/events.js';
import AppKeys from '../modules/keys.js';
import api from '../modules/api.js';
import Debug from '../modules/debug.js';
import { updateCid } from '../modules/visit.js';

const debug = Debug('main');

/*
     <fm-app>: The controlling app
*/
class MainApp extends LitElement {
  static get styles() {
    return [tooltip];
  }
  static get properties() {
    return {
      authorised: {type: Boolean},
      ready: {type:Boolean},
      competitions: {type: Array},  //array of {name,cid, adminstrator,open, rid - latest round} 
      rounds: {type: Array},
      compversion: {type: Number},  //incremented if number of competitions has changed
      serverError: {type: Boolean}, //we received an error
      scores: {type: Boolean}, //We need an "Overall Scores option in the menu"
      close: {type: Boolean} //need return to previous page icon in toolbar
    };
  }
  constructor() {
    super();
    this.ready = false;
    this.serverError = false;
    this.authorised = false;
    this.competitions=[];
    this.rounds = [];
    this.compVersion=0;
    this.scores = false;
    this.close = false;
    this.serverError = false;
    this._keyPressed = this._keyPressed.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    this.removeAttribute('unresolved');
    this.editingDcid = false;

  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  update(changed) {
    if (changed.has('authorised')) {
      debug('authorised changed to ' + this.authorised);
      if (this.authorised) {
        //once authorised, the menu key invokes the main menu
        document.body.addEventListener('key-pressed', this._keyPressed);
        if (this.keys === undefined) {
          this.keys= new AppKeys(document.body, 'f1 f2 f12');
        } else {
          this.keys.connect();
        }
        this._fetchCompetitons();
      } else {
        if (this.keys !== undefined) this.keys.disconnect()
        document.body.removeEventListener('key-pressed', this._keyPressed);
      }
      
    }
    if (changed.has('compVersion') && this.compVersion > 0 && this.authorised) {
      this._fetchCompetitons();
    }
    super.update(changed);
  }


  updated(changed) {
    if (changed.has('authorised') && this.authorised) {
      this.mainmenu = this.shadowRoot.querySelector('#mainmenu');
      this.competitionMenu = this.shadowRoot.querySelector('#competitions');

      this.menuicon = this.shadowRoot.querySelector('#menuicon');

      this.fmPages = this.shadowRoot.querySelector('#pages');

    }

    super.updated(changed);
  }
  firstUpdated() {
    this.sessionMgr = this.shadowRoot.querySelector('#session');
  }

  render() {
    
    const admin = (global.user.global_admin === 1 || global.user.uid === global.luid && global.cid === global.lcid) ;
    return html`  
      <style>

        html,
        body {
          height: 100vh;
        }

        body {
          margin: 0;
        }

        :host {
          height: 100%;
          display: flex;
          flex-direction: column-reverse;
          font-size:12px;
          --icon-size:24px;
        }
        #menuicon, #closeicon {
          display: flex;
          flex-direction: row;
          cursor:pointer;
          background-color: var(--header-icon-background-color);
          color: var(--header-icon-color);
          margin: 0 15px;
          border: none;
          padding: 5px;
          border-radius:5px;
          box-shadow: 2px 2px 5px 4px var(--shadow-color);
          --icon-size:30px;
        }
        #menuicon:active, #closeicon.active {
          border: none;
          padding: 5px;
          border-radius:5px;
          box-shadow: 2px 2px 5px 4px var(--shadow-color);
          box-shadow:none;
        }
        .menucontainer {
          display:flex;
          flex-direction: column-reverse;
          padding: 10px;
        }

        [role="menuitem"] {
          --icon-size: 18px;
          height: 20px;
          display:flex;
          flex-direction:row;
          cursor: pointer;
        }
        [role="menuitem"] span:nth-of-type(2) {
          margin-left:auto;
        }
        [role="menuitem"]>material-icon {
          margin-right: 4px;
        }
        header {
          flex: 0 1 0;
        }
         section {
          flex:1 0 0;
        }

       .fixed {
          flex: 0 1 64px;
        }
        .primary {
          color: var(--accent-constrast-color);
          background-color: var(--accent-color);
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items:center;
        }

        .iconreplace {
          width: var(--icon-size);
          height:var(--icon-size);
          background-color: transparent;
        }
        #logocontainer {
          display: flex;
          flex-direction: row;
          justify-content: center;
          flex: 1 0 auto;
        }
        #logo {
          height: 64px;
          width: 64px;
          background-size: 64px 64px;
          background-image: var(--logo-background);
        }
        #appinfo {
          display:flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          flex: 1 0 auto;
        }
        #version {
          font-size: 12px;
        }
        #copy {
          font-size: 8px;
        }
        session-manager[hidden], fm-pages[hidden], error-manager[hidden] {
          display: none !important;
        }
        .admins{
          margin: 10px 0;
        }

        hr.sep {
          width:100%;
          border-top: 1px -solid var(--menu-separator);
        }
        @media (min-width: 500px) {
          :host, .menucontainer {
            flex-direction: column;
          }

          [role="menuitem"] {
            height: 20px;
          }
        }

      </style>
      ${cache(this.authorised ? html`
        <dialog-box id="mainmenu">
          <div class="menucontainer">
            <div role="menuitem" @click=${this._goHome}><material-icon>home</material-icon><span>Home</span></div>
            ${cache(this.scores? html`
              <div id="scores" role="menuitem" @click=${this._selectPage}><material-icon>people_outline</material-icon><span>Scores</span><span>F2</span></div>
            `:'')}
            <hr class="sep"/>
            ${cache(this.competitions.length > 0 ?html`
              <div id="cm" role="menuitem" @click=${this._competitionsMenu}><span>Competitions</span>
              <span><material-icon>navigate_next</material-icon></span></div>
              <hr class="sep"/>
            `:'')}
            <div role="menuitem" @click=${this._logoff}><material-icon>exit_to_app</material-icon>Log Off</div>
            <div id="profile" role="menuitem" @click=${this._selectPage}><material-icon>account_box</material-icon><span>Edit Profile</span> <span>F12</span></div>
            <hr class="sep"/>
            <div id="navref" role="menuitem" @click=${this._selectPage}><material-icon>place</material-icon><span>Navigation Help</span></div>
            <div id="help" role="menuitem" @click=${this._selectPage}><material-icon>help</material-icon><span>How To Play</span><span>F1</span></div>
            ${cache((admin || global.user.approve) ? html`
              <hr class="sep"/>
              <div id="approve" role="menuitem" @click=${this._selectPage}>
                <material-icon>grading</material-icon>Approve Members</div>         
              ${cache(admin ? html`
                ${cache(global.user.global_admin ? html`
                  <div id="gadm" role="menuitem" @click=${this._selectPage}><material-icon>public</material-icon>Global Admin</div>
                `: '')}
                <div id="admin" role="menuitem" @click=${this._selectPage}>
                  <material-icon>admin_panel_settings</material-icon>Competition Admin</div>
              `: '')}
            `:'')}
          </div>
        </dialog-box>
        <dialog-box id="competitions" closeOnClick @overlay-closed=${this._compClosed} position="right">
          <div class="menucontainer">
            ${cache(this.competitions.map(competition => 
              html`<div role="menuitem" data-cid=${competition.cid} @click=${this._competitionSelected}><span>${competition.name}</span>
              ${cache(competition.cid === global.cid ? html`<span><material-icon>check_box</material-icon></span>` : '')}</div>
            `))}
          </div>
        </dialog-box>
        <dialog-box id="rounds" closeOnClick @overlay-closed=${this._roundClosed} position="right">
          <div class="menucontainer">
            ${cache(this.rounds.map(round => html`
                <div data-rid=${round.rid} @click=${this._showRound} role="menuitem"><span>${round.name}</span></div>
            `))}
          </div>
        </dialog-box>       
        `:'')}
      <header class="primary fixed">
        ${cache(this.authorised? html`
            <div id="menuicon"  class="right" @click=${this._menu} data-tooltip="Main Menu">
              <material-icon>menu</material-icon>
            </div>
            ${cache(this.close? html`
              <div id="closeicon"  class="right" @click=${this._close} data-tooltip="Back a Level">
                <material-icon>reply</material-icon>
              </div>
            `:html`<div class="iconreplace"></div>`)}
                    
        `: html`<div class="iconreplace"></div><div class="iconreplace"></div>`)}
        <div id="logocontainer" ><div id="logo"></div></div>
        <div id="appinfo">
          <div id="version">${global.version}</div>
          <div id="copy">&copy; 2008-${global.copyrightYear} Alan Chandler</div>
        </div>
      </header>
      <section class="scrollable">
        <error-manager ?hidden=${!this.serverError} @session-status=${this._errorChanged} ></error-manager>    
        <session-manager 
          ?hidden=${this.authorised || this.serverError} 
          id="session" 
          .authorised=${this.authorised} 
          @auth-changed=${this._authChanged}></session-manager>
        ${cache(this.authorised ? html`
          <page-manager
            id="pages"
            ?hidden=${this.serverError}
            @competitions-changed=${this._refreshComp}
            @menu-reset=${this._menuReset}
            @menu-add=${this._menuAdd}
            @auth-changed=${this._authChanged}>
            </page-manager>      
        `:'')}
      </section>
    `;
  }
  _authChanged(e) {
    this.authorised = e.changed;
  }
  
  _changeDComp(e) {
    if (this.competitionMenu) {
      this.editingDcid = true;
      this.competitionMenu.open();
    }
  }
  _close() {
    this.close = false;
    this.fmPages.dispatchEvent(new PageClose());
  }
  _compClosed(e) {
    this.mainmenu.close();
  }
  _competitionSelected(e) {
    const cid = parseInt(e.currentTarget.dataset.cid,10);
    updateCid(cid);
    debug('competition cid ' + cid + ' selected');
    this.mainmenu.close();
    switchPath('/');
    this.requestUpdate(); //refresh needed in particular competitions menu.
  }
  _competitionsMenu() {
    if(this.competitionMenu) {
      this.competitionMenu.positionTarget = this.shadowRoot.querySelector('#cm');
      this.competitionMenu.show();
    }
  }
  _editRound(e){
    const rid = parseInt(e.currentTarget.dataset.rid, 10);
    this.mainmenu.close();
    switchPath(`/editround/${this.cid}/${rid}`);
  }
  _errorChanged(e) {
    if (e.status.type === 'error') {
      this.serverError = true;
      this.authorised = false;
    } else if (e.status.type === 'reset') {
      this.serverError = false;
    }
  }
  async _fetchCompetitons() {
    this.competitions = await api(`profile/fetch_competitions`);
    if (this.competitions.length > 0) {
      global.lcid = this.competitions[0].cid;
      global.luid = this.competitions[0].administrator;
      global.lrid = this.competitions[0].rid;
    }
    if (global.cid === 0) updateCid(global.lcid);

    this.compVersion = 0;
  }
  _globalChanged() {
    this.requestUpdate();
  }

  _goHome() {
    if (global.cid !== global.lcid) {
      updateCid(global.lcid);
    }
    switchPath('/');
  }
  _keyPressed(e) {
    debug('key press from key ' + e.key);
    switch (e.key) {
      case 'f1':
        switchPath('/help');
        break;
      case 'f2':
        switchPath('/scores');
        break;
      case 'f12':
        switchPath('/profile');
        break;
    }
  }
  _logoff() {
    debug('logoff request about to be sent to session manager');
    //the difference between the following and just changing authorised, is that we clear the cookie
    this.sessionMgr.dispatchEvent(new SessionStatus({state: 'logoff'}));
  }
  _menu(e) {
    if (this.mainmenu) {
      this.mainmenu.positionTarget = this.menuicon;
      this.mainmenu.show();
    }
  }
  _menuAdd(e) {
    debug(e.menu + ' being added to menu');
    switch(e.menu) {
      case 'scores':
        this.scores = true;
        break;
      case 'close':
        this.close = true;
        break;
      //add others later
    }
  }
  _menuReset() {
    debug('menu reset received');
    this.scores = false;
    this.close = false;
    //add others later
  }

  _refreshComp() {
    debug('refresh competition data received');
    this.compVersion++
  }
  async _reset(e) {
    this.serverError = false;
    if (this.authorised) {
      this._goHome();
    } else {
      await this.requestUpdate();
      const session = this.shadowRoot.querySelector('#session');
      session.dispatchEvent(new SessionStatus({state:'reset'}));
    }
  }
  _ridChanged(e){
    this.rid = e.changed;
  }
  _roundClosed() {
    this.mainmenu.close();
  }
  _roundsMenu() {
    if(this.roundsMenu) {
      this.roundsMenu.positionTarget = this.rm;
      api(`user/fetch_rounds`).then(response => {
        this.rounds = reponse.rounds;
        this.roundsMenu.show();
      });
    }
  }
  _selectPage(e) {
    this.mainmenu.close();
    switchPath(`/${e.currentTarget.id}`);
  }

}
customElements.define('main-app', MainApp);