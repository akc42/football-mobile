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
import './app-error.js';
import './app-overlay.js';
import './app-pages.js';
import './app-session.js';
import './material-icon.js';

import tooltip from '../styles/tooltip.js';

import { SessionStatus } from '../modules/events.js';
import AppKeys from '../modules/keys.js';
import api from '../modules/api.js';
import Debug from '../modules/debug.js';
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

      cid: {type: Number}, 
      competitions: {type: Array},  //array of {name,cid} 
      rounds: {type: Array},
      compversion: {type: Number},  //incremented if number of competitions has changed
      serverError: {type: Boolean} //we received an error
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
    this.cid = 0;

    window.fetch('/api/config/styles', { method: 'get' }).then(response => {
      if (response.status === 200) return response.json();
      return {};
    }).then(styles => {
      for (let key in styles) {
        this.style.setProperty('--' + key.replace(/_/g,'-'), styles[key]);
      }
    });
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
      if (this.authorised) {
        //once authorised, the menu key invokes the main menu
        document.body.addEventListener('key-pressed', this._keyPressed);
        if (this.keys === undefined) {
          this.keys= new AppKeys(document.body, 'Enter F12');
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
    if (changed.has('cid')) {
      this.rounds = []; //clear out rounds as soon as we have a new cid. We'll get them again if needed.
    }
    super.update(changed);
  }


  updated(changed) {
    if (changed.has('authorised') && this.authorised) {
      this.mainmenu = this.shadowRoot.querySelector('#mainmenu');
      this.competitionMenu = this.shadowRoot.querySelector('#competitions');

      this.menuicon = this.shadowRoot.querySelector('#menuicon');
      this.cm=this.shadowRoot.querySelector('#cm');

    }

    super.updated(changed);
  }
  render() {
    const luid = this.competitions.length > 0 ? this.competitions[0].administrator:0;
    const admin = (global.user.global_admin === 1 || global.user.uid === luid) ;
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
        #menuicon {
          display: flex;
          flex-direction: row;
          cursor:pointer;
          margin: 0 0 0 40px;
          border: none;
          padding: 5px;
          border-radius:5px;
          box-shadow: 2px 2px 5px 4px rgba(0,0,0,0.2);
          --icon-size:30px;
        }
        #menuicon:active {
          border: none;
          padding: 5px;
          border-radius:5px;
          box-shadow: 2px 2px 5px 4px rgba(0,0,0,0.2);
          box-shadow:none;
        }
        .menucontainer {
          display:flex;
          flex-direction: column-reverse;
        }

        [role="menuitem"] {
          --icon-size: 12px;
          height: 20px;
          display:flex;
          flex-direction:row;
          cursor: pointer;
        }
        [role="menuitem"] span:nth-of-type(2) {
          margin-left:auto;
        }
        header {
          flex: 0 1 auto;
        }
         section {
          flex:1 0 0;
        }

       .fixed {
          flex: 0 1 64px;
        }
        .primary {
          color: var(--app-primary-text);
          background-color: var(--app-primary-color);
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items:center;
        }

        .iconreplace {
          width: var(--icon-size);
          height:var(--icon-size);
          background-color: transparent;
        }
        #logo {
          height: 64px;
          width: 64px;
        }
        #appinfo {
          display:flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        #version {
          font-size: 12px;
        }
        #copy {
          font-size: 8px;
        }
        app-session[hidden], app-pages[hidden], app-error[hidden] {
          display: none !important;
        }
        .admins{
          margin: 10px 0;
        }
        .menuheading {
          border-bottom-width:1px;
          border-bottom-style: dashed;
          text-align: center;
          font-weight: bold;
        }
        .menugroup {
          padding: 10px 0px;   
          border-bottom:2px solid var(--app-accent-color);     
        }
        .menugroup.gadmin .menuheading {
          border-color: red;
        }
        
        .menugroup.admin .menuheading {
          border-color: green;
        }
         .menugroup.approver .menuheading {
          border-color: olivedrab;
        }
        hr {
          width:100%;
        }
        hr.user {
          border-top:2px solid var(--app-accent-color);
        }
        hr.sep {
          border-top: 1px dotted red;
        }
        hr.admin {
          border-top: 1px dashed green;
        }
        

        @media (min-width: 500px) {
          :host, .menucontainer {
            flex-direction: column;
            font-size:12pt;
          }

          [role="menuitem"] {
            height: 20px;
          }
        }

      </style>
      ${cache(this.authorised ? html`
        <app-overlay id="mainmenu">
          <div class="menucontainer">
            <div role="menuitem" @click=${this._goHome}><span>Home<span><span>F1<material-icon>home</material-icon></div>
            <hr class="sep"/>
            ${cache(this.competitions.length > 0 ?html`
              <div id="cm" role="menuitem" @click=${this._competitionsMenu}><span>Competitions</span>
              <span><material-icon>navigate_next</material-icon></span></div>
              <hr class="sep"/>
            `:'')}
            <div id="editprofile" role="menuitem" @click=${this._selectPage}><span>Edit Profile</span> <span>F12</span></div>
            <hr class="user"/>            
          ${cache((admin || this.user.approve) ? html`
            <div class="admins">
              <hr class="user"/>
              ${cache(admin ? html`
                ${cache(global.user.global_admin ? html`
                  <div class="gadmin menugroup">
                    <div class="menuheading">Global Admin</div>
                    <div id="createcomp" role="menuitem" @click=${this._selectPage}>Create Competition</div>
                    <hr class="sep"/>
                    <div id="promoteuser" role="menuitem" @click=${this._selectPage}>Promote Users To Admin</div>
                  </div>
                `: '')}
                <div class="admin menugroup">
                  <div class="menuheading">Admin</div>
                  <div id="editround" role="menuitem" @click=${this._selectPage}>Edit Latest Round</div>
                  <hr class="sep"/>
                  <div id="newround" role="menuitem" @click=${this._selectPage}>Create Round</div>
                  <div id="editcomp" role="menuitem" @click=${this._selectPage}>Competition Details</div>
                  <hr class="admin"/>
                  <div id="rm" role="menuitem" @click=${this._roundsMenu}><span>Select Round to Edit</span>
                    <span><material-icon>navigate_next</material-icon></span></div>
                </div>
              `: '')}
              <div class="approver menugroup">
                <div class="menuheading">Approver</div>
                <div id="memberapprove" role="menuitem" @click=${this._selectPage}>Approve Members</div>
              </div>  
            </div>         
          `:'')}
          </div>
        </app-overlay>
        <app-overlay id="competitions" closeOnClick @overlay-closed=${this._compClosed} position="right">
          ${cache(this.competitions.map(competition => 
            html`<div role="menuitem" data-cid=${competition.cid} @click=${this._competitionSelected}><span>${competition.name}</span>
            ${cache(competition.cid === this.cid ? html`<span><material-icon>check_box</material-icon></span>` : '')}</div>
          `))}
        </app-overlay>
        <app-overlay id="rounds" closeOnClick @overlay-closed=${this._roundClosed} position="right">
          ${cache(this.rounds.map(round => html`
              <div data-rid=${round.rid} @click=${this._editRound} role="menuitem"><span>${round.name}</span>${cache(
                round.rid === this.rid ? html`<span><material-icon>check_box</material-icon></span>` :'')}</div>
          `))}
        </app-overlay>       
        `:'')}
      <header class="primary fixed">
        ${cache(this.authorised? html`
            <div id="menuicon"  class="right" @click=${this._menu} data-tooltip="Main Menu">
              <material-icon>${global.mainMenuIcon}</material-icon>
            </div>        
        `:html`<div class="iconreplace"></div>` )}
        <img id="logo" src="/appimages/football-logo.svg" alt="football logo"/>
        <div id="appinfo">
          <div id="version">${global.version}</div>
          <div id="copy">&copy; 2008-${global.copyrightYear} Alan Chandler</div>
        </div>
      </header>
      <section class="scrollable">
        <app-error ?hidden=${!this.serverError} @session-status=${this._errorChanged} ></app-error>    
        <app-session 
          ?hidden=${this.authorised || this.serverError} 
          id="session" 
          .authorised=${this.authorised} 
          @auth-changed=${this._authChanged}></app-session>
        ${cache(this.authorised ? html`
          <app-pages
            ?hidden=${this.serverError}
            @competitions-changed=${this._refreshComp}
            @auth-changed=${this._authChanged}>
          </app-pages>      
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
  _compClosed(e) {
    this.mainmenu.close();
  }
  _competitionSelected(e) {
    this.cid = parseInt(e.currentTarget.dataset.cid,10);
    this.mainmenu.close();
  }
  _competitionsMenu() {
    if(this.competitionMenu) {
      this.competitionMenu.positionTarget = this.cm;
      this.competitionMenu.show();
    }
  }
  _globalChanged() {
    this.requestUpdate();
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
    const response = await api(`admin/fetch_competitions`);
    this.competitions = response.competitions;
    this.compVersion = 0;
  }
  _goHome() {
    switchPath('/');
  }
  _keyPressed(e) {

  }
  _menu(e) {
    if (this.mainmenu) {
      this.mainmenu.positionTarget = this.menuicon;
      this.mainmenu.show();
    }
  }
  _refreshComp() {
    this.compVersion++
  }
  async _reset(e) {
    this.serverError = false;
    if (this.authorised) {
      this._goHome();
    } else {
      await this.requestUpdate();
      const session = this.shadowRoot.querySelector('#session');
      session.dispatchEvent(new SessionStatus('reset'));
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
      api(`${this.cid}/admin/fetch_rounds`).then(response => {
        this.rounds = reponse.rounds;
        this.roundsMenu.show();
      });
    }
  }
  _selectPage(e) {
    switchPath(`/${e.currentTarget.id}/${this.cid}`);
  }
}
customElements.define('main-app', MainApp);