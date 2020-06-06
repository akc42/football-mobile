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
import {classMap} from '../libs/class-map.js';
import {cache} from '../libs/cache.js';
import config from '../modules/config.js'; 
import {switchPath} from '../modules/utils.js';
import './app-error.js';
import './app-overlay.js';
import './app-pages.js';
import './app-session.js';
import { SessionStatus } from '../modules/events.js';
import AppKeys from '../modules/keys.js';



/*
     <fm-app>: The controlling app
*/
class MainApp extends LitElement {

  static get properties() {
    return {
      authorised: {type: Boolean},
      version: {type: String},
      copyrightYear: {type: String},
      cid: {type: Number},
      user: {type: Object},
      globalAdmin: {type:Boolean},
      adminExperience: {type: Boolean},
      competitions: {type: Array},  //array of {name,cid} 
      lastCompTime: {type: Number},
      rounds: {type: Array},  //array of {name,rid}
      lastRoundTime: {type: Number},
      rid: {type: Number},
      dcid: {type: Number},
      lcid: {type: Number}, //cid of latest competition
      luid: {type: Number}, //admin of latest competition
      drid: {type: Number},
      menuIcon: {type: String},
      webmaster: {type: String},
      server: {type: Boolean},
      serverError: {type: Boolean} //we received an error
    };
  }
  constructor() {
    super();
    this.server = false;
    this.serverError = false;
    this.authorised = false;
    this.version = 'v4.0.0';
    this.copyrightYear = '2020'
    this.cid = 0;
    this.user = {uid:0, name:'', approve: false, admin: false}
    this.rid = 0;
    this.competitions=[];
    this.lastCompTime=0;
    this.rounds = [];
    this.lastRoundTime = 0;
    this.dcid = 0;
    this.drid = 0;
    this.menuIcon = 'menu';
    this.webmaster = 'webmaster@example.com';
    window.fetch('/api/config/styles', { method: 'get' }).then(response => {
      if (response.status === 200) return response.json();
      return {};
    }).then(styles => {
      for (let key in styles) {
        this.style.setProperty('--' + key.replace(/_/g,'-'), styles[key]);
      }
    });
    config().then(config => {
      this.server = config.server;
      if (this.server) {
        this.version = config.version;
        this.copyrightYear = config.copyrightYear;
        this.dcid = config.dcid;
        this.drid = config.drid;
        this.lcid = config.lcid;
        this.luid = config.luid;
        if (this.cid === 0) this.cid = this.dcid; //we use dcid if cid not been set yet, else we leave it
        if (this.rid === 0) this.rid = this.drid;
        this.menuIcon = config.mainMenuIcon;
        this.webmaster = config.webmaster;
        //and the rest
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
        
        api(`admin/fetch_competitions`).then(response => {
          this.competitions = response.competitions;
          this.lastCompTime = response.timestamp;
        });
        if (this.cid !== 0) {
          //we have a specific competition set, so get its rounds
          api(`${cid}/fetch_rounds`).then(response => {
            this.rounds = response.rounds;
            this.lastRoundTime = response.timestamp;
          });
        }
      } else {
        if (this.keys !== undefined) this.keys.disconnect()
        document.body.removeEventListener('key-pressed', this._keyPressed);
      }
    } else if (changed.has('cid') && this.authorised && this.cid !== 0) {
      //we have a specific competition set, so get its rounds
      api(`${cid}/fetch_rounds`).then(response => {
        this.rounds = response.rounds;
        this.lastRoundTime = response.timestamp;
      });
    }
    super.update(changed);
  }
  firstUpdated() {
    this.mainmenu = this.shadowRoot.querySelector('#mainmenu');
    this.competitionMenu = this.shadowRoot.querySelector('#competitions');
    this.roundsMenu = this.shadowRoot.querySelector('#rounds');
    this.session = this.shadowRoot.querySelector('#session');
  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    const admin = (this.luid !== 0 && (this.luid === this.user.uid) || this.user.admin) ;
    return html`  
      <style>
        :host {

          height: 100vh;
          display: flex;
          flex-direction: column-reverse;
        }
        #mainmenu {
          display:flex;
          flex-direction: column-reverse;
        }
        [role="menuitem"] {
          --icon-size: 12px;
          height: 12px;
          font-weight: bold;
        }
        header {
          height: var(--app-header-size, 64px);
          color: var(--app-reverse-text-color, white);
          background-color: var(--app-header-color,#adcabd );
          display: flex;
          flex-direction: row;
          justify-content: space-between;
          align-items:center;
        }
        section {
          height: calc(100vh - var(--app-header-size, 64px));
          overflow-y:auto;
        }
        .flexing {
          display: flex;
          flex-direction: column;
        }

        .iconreplace {
          width: var(--icon-size);
          height:var(--icon-size);
          background-color: transparent;
        }
        #logo {
          display:block;
          color: transparent;
          height: var(--app-header-size, 64px);
          width: var(--app-header-size, 64px);
          background: url("../appimages/football-logo.svg");
          background-size: var(--app-header-size, 64px) var(--app-header-size,64px);
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

        @media (min-width: 500px) {
          :host, #mainmenu {
            flex-direction: column;
          }
        }
        #title {
          font-weight: bold;
          font-size: 12px;
          color:black;
          background-color: white;
          align-self: center;
        }
        #apologies {
          padding: 30px;
        }

      </style>

       ${cache(this.authorised ? html`
        <app-overlay id="mainmenu" closeOnClick>
          <div role="menuitem" @click=${this._goHome}>Home</div>
          <div role="menuitem" @click=${this._roundsMenu}>Rounds</div>
          <div role="menuitem" @click=${this._competitionsMenu}>Competitions</div>
          ${cache((admin || this.user.approve) ? html`
            ${cache(admin ? html`
              ${cache(this.user.admin ? html`
                <div id="createcomp" role="menuitem" @click=${this._selectPage}>Create Competition</div>
                <div role="menuitem" @click=${this._changeDcomp}>Default Competition</div>
              `: '')}
              <div role="menuitem" @click=${this._editRound}>Edit Round</div>
              <div id="newround" role="menuitem" @click=${this._selectPage}>Create Round</div>
              <div id="editcomp" role="menuitem" @click=${this._selectPage}>Edit Competition</div>
            `: '')}
            <div id="memberapprove" role="menuitem" @click=${this._selectPage}>Approve Members</div>           
          `:'')}
          <div id="editprofile" role="menuitem" @click=${this._selectPage}>Edit Profile F12</div>
        </app-overlay>
        <app-overlay id="competitions" closeOnClick @overlay-closed=${this._compClosed}>
          ${cache(this.competitions.filter(competition => competition.open || this.globalAdmin ||  //Only a few can see hidden competitions
              (admin && competition.cid === this.lcid)).map(competition => 
            html`<div role="menuitem" data-cid=${competition.cid} @click=${this._competitionSelected}>${competition.name}${cache(
                competition.cid === this.dcid ? html`<material-icon>home</material-icon>` : html`<div class="iconreplace"></div>`
            )}${cache(
              competition.cid === this.cid ? html`<material-icon>check_box</material-icon>` : html`<div class="iconreplace"></div>`
            )}</div>
          `))}
        </app-overlay>
        <app-overlay id="rounds" closeOnClick>
          ${cache(this.rounds.map(round => html`<div data-rid=${round.rid} @click=${this._roundSelected} role="menuitem">${round}${cache(
            round.rid === this.rid ? html`<material-icon>check_box</material-icon>` : html`<div class="iconreplace"></div>`
          )}</div>
          `))}
        </app-overlay>       
        `:'')}
      <header>
        ${cache(this.authorised? html`
        <material-icon @click=${this._menu}>${this.menuIcon}</material-icon>        
        `:html`<div class="iconreplace"></div>` )}
        <div id="logo">Football Logo</div>
        <div id="appinfo">
          <div id="version">${this.version}</div>
          <div id="copy">&copy; 2008-${this.copyrightYear} Alan Chandler</div>
        </div>
      </header>
      <section class="${classMap({flexing: !this.authorised || this.serverError})}">
        <app-error webmaster="${this.webmaster}" @session-status=${this._errorChanged} ></app-error>
        ${cache(this.serverError? '' : html`     
          <app-session id="session" @auth-changed=${this._authChanged}></app-session>
          ${cache(this.authorised ? html`
            <app-pages
              .user=${this.user}
              .cid=${this.cid}
              .rid=${this.rid}
              @rid-changed=${this._ridChanged}
              .dcid=${this.dcid}
              @dcid-changed=${this._dcidChanged}
              @competitions-changed=${this._refreshComp}
              @rounds-changed=${this._refreshRound}></app-pages>      
          `:'' )}
        `)}
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
  _compChanged(e) {
    this.cid = e.changed;
  }
  _compClosed(e) {
    this.editingDcid = false;  //we were either changing dcid or not, either way we aren't anymore
  }
  _competitionSelected(e) {
    const selected = parseInt(e.currentTarget.dataset.cid,10);
    if (this.editingDcid) {
      this.dcid = selected;
    } else {
      this.cid = selected;
    }
    this.editingDcid = false;
  }
  _dcidChanged(e) {
    this.dcid = e.changed;
  }
  _editRound(e){

  }
  _errorChanged(e) {
    if (e.status.type === 'error') {
      this.serverError = true;
      this.authorised = false;
    } else if (e.status.type === 'reset') {
      this.serverError = false;
    }
  }
  _goHome() {
    switchPath('/');
  }
  _keyPressed(e) {

  }
  _menu(e) {
    if (this.mainmenu) this.mainmenu.show();
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
  _roundsMenu(e) {
    if(this.roundsMenu) this.roundsMenu.show();
  }
  _roundSelected(e) {
    this.rid = parseInt(e.currentTarget.dataset.rid,10);
  }
  _selectPage(e) {
    switchPath(`/${e.currentTarget.id}/${this.cid}`);
  }
}
customElements.define('main-app', MainApp);