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
import {cache} from '../libs/cache.js';
import {classMap} from '../libs/class-map.js';

import './fm-page.js';
import page from '../styles/page.js';
import button from '../styles/button.js';
import './fm-input.js';
import { CompetitionCreate, DeleteRequest, CompetitionDelete, CompetitionChanged } from '../modules/events.js';
import { switchPath } from '../modules/utils.js';
import { s } from '../libs/lit-html-f17e05ab.js';


/*
     <gadm-home>: basic competition create functions, plus menu to other
*/
class GadmHome extends LitElement {
  static get styles() {
    return [page, button, css``];
  }
  static get properties() {
    return {
      competitions: {type: Array}, //list of competitions without registered users
      users: {type: Array},
      selectedUser: {type: Number},
      new: {type: Object}
    };
  }
  constructor() {
    super();
    this.competitions = [];
    this.users = [];
    this.new = {cid:0, name:'', administrator : 0};
    this.selectedUser = 0;
    this._deleteReply = this._deleteReply.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    this.new = {cid: 0, name: '', administrator: 0};
    this.deleteCid = 0;
    this.addEventListener('delete-reply', this._deleteReply);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('delete-reply', this._deleteReply);
  }
  update(changed) {
    if (changed.has('selectedUser')) {
      const oldUser = changed.get('selectedUser') 
      if (oldUser > 0) {
        const user = this.users.find(u => u.uid === oldUser);
        if (user !== undefined) user.selected = false;
      }
      if (this.selectedUser > 0) {
        const user = this.users.find(u => u.uid === this.selectedUser);
        if (user !== undefined) {
          user.selected = true;
          const userElements = this.userList.children;
          for(const e of userElements) {
            if (e.dataset.uid === this.selectedUser.toString()) {
              e.scrollIntoView({behavior: 'smooth',block: 'start' });
              break;
            }
          }
        }
      } else {
        this.users.forEach(u => u.seleted = false);
      }
    }
    if (changed.has('competitions')) {
      this.new = { cid: 0, name: '', administrator: 0 };
    }
    super.update(changed);
  }
  firstUpdated() {
    this.newName = this.shadowRoot.querySelector('#newname');
    this.userList = this.shadowRoot.querySelector('#userlist');
  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`
      <style>
       :host {
         --icon-size: 20px;
       }
       .row {
         display: flex;
         flex-direction: row;
         align-items: center;
       }
       .adm {
         color: var(--item-present);
       }
       #container {
         display: grid;
         grid-gap: 2px;
         grid-template-columns: 50px 80px 1fr;
         grid-template-areas: 
          "competition competition competition"
          "other other explain"
          ". staff staff";
       }
       #competition {
         grid-area: competition;

       }
       #other {
         grid-area: other;
         display: flex;
         flex-direction: column;
         padding: 20px;
       }
       #other button {
         margin: 10px;
       }
       #explain {
         grid-area: explain;
         border-left: 2px solid var(--color);
         padding-left: 10px;
       }
       #explain .non{
        color: var(--disabled-color)
       }
       #explain .ass {
         color: var(--item-present);
       }
       #staff {
         grid-area: staff;
       }
       #userlist {
         height: 120px;
         overflow-y: scroll;
         scroll-snap-type: y mandatory;
       }
       .name {
         width: 100%;
       }
       .pa, .ga, .ma, .us, .iconreplace {
         width: 20px;
         margin: 0 2px;
       }

      .u {
        cursor: pointer;
        border-bottom: 1px dotted var(--accent-color);
        margin-bottom: 1px;
        scroll-snap-align: start;
      }
      #competition hr {
        border-bottom: 1px dotted var(--accent-color);
      }
      .input {
        width: 100%;
      }
      .adm, .del, .new {
        width: 20px;
        margin: 0 2px;
        cursor: pointer;
      }
      .adm {
        color: var(--disabled-color); 
      }
      .adm.ass {
        color: var(--item-present);
      }
      .new {
        color: var(--create-item-color); 
      }
      </style>
      <fm-page id="page" heading="Global Admin">
        <div slot="subheading">Competition Management</div>
        <div id="container">
          <section id="competition">
            ${this.competitions.length > 0? html`
              <p>List of competitions yet to have registered users</p>
              ${cache(this.competitions.map(comp => html`
                <div class="row">
                  <fm-input 
                    class="input" 
                    .value=${comp.name} 
                    required 
                    data-cid=${comp.cid}
                    @focus=${this._inputGotFocus} 
                    @blur=${this._compName} 
                    message="Competition Name Required"></fm-input>
                  <material-icon 
                    class="adm ${classMap({ ass: comp.administrator !== 0 })}" 
                    data-cid=${comp.cid} 
                    @click=${this._newAdministrator}>font_download</material-icon>
                  <material-icon class="del" data-cid=${comp.cid} @click=${this._maybeDelete}>close</material-icon>
                </div> 
              `))}
              <hr/>
            `: ''}
            
            <div class="row">
              <fm-input 
                id="newname"
                class="input" 
                .value=${this.new.name} 
                @value-changed=${this._newName}
                @focus=${this._inputGotFocus}
                required 
                data-cid="0"
                label="New Competition" 
                .message=${this.new.name.length > 0 ? 'Adminstrator Must Be Assigned' :'Competition Name Required'}></fm-input>
              <material-icon class="adm${classMap({ ass: this.new.administrator !== 0 })}" @click=${this._assignAdministrator}>font_download</material-icon>
              <material-icon class="new"  @click=${this._newCompetition} >note_add</material-icon>
            </div> 
          </section>
          <section id="other">
            <button @click=${this._promote}>Promote Users</button>
            <button @click=${this._sendEmail}>Send Email to Users</button>
          </section>
          <section id="explain">
              <p>Click on a user to select them and then click on a grey <material-icon class="non">font_download</material-icon> icon against a competition to assign that user to be the Adminsistrator of it.  If the icon <material-icon class="ass">font_download</material-icon> is showing green an Administrator is already assigned.  However you can change the competition's Administrator to the selected user if you click on it.</p>
          </section>
          <section id=staff>  
            <div id="userlist">
              ${cache(this.users.map(user => html`
                <div class="row u" data-uid="${user.uid}" @click=${this._toggleSelected}>
                  <div class="name">${user.name}</div>
                  ${user.previous_admin !== 0 ? html`<material-icon class="pa">font_download</material-icon>`: html`<div class="iconreplace"></div>`}
                  ${user.global_admin !== 0 ? html`<material-icon class="ga">public</material-icon>` : html`<div class="iconreplace"></div>`}
                  ${user.member_approve !== 0 ? html`<material-icon class="ma">grading</material-icon>` : html`<div class="iconreplace"></div>`}
                  <material-icon class="us">${user.selected ? 'check_box' : 'check_box_outline_blank'}</material-icon>
                </div>
              `))}
            </div>

          </section>
        </div>
      </fm-page>
    `;
  }
  _assignAdministrator(e) {
    e.stopPropagation();
    this.new = { ...this.new, administrator: this.selectedUser};
    this.newName.validate(); 
    if (this.selectedUser === 0) this.newName.invalid = true; //force an error message
  }
  _compName(e) {
    e.stopPropagation();
    if (e.currentTarget.validate()) {
      const cid = parseInt(e.currentTarget.dataset.cid, 10);
      const competition = this.competitions.find(c => c.cid === cid);
      if (competition !== undefined) {
        competition.name = e.currentTarget.value;
        this.dispatchEvent(new CompetitionChanged({cid:cid, name: competition.name }));
      }
    }
  }
  _deleteReply(e) {
    e.stopPropagation();
    //just recieving this means go ahead
    if (this.deleteCid !== 0) {
      this.selectedUser = 0;
      this.dispatchEvent(new CompetitionDelete(this.deleteCid));
    }
  }
  _inputGotFocus(e) {
    e.stopPropagation();
    console.log('Focus on ', e.currentTarget.id, 'cid', e.currentTarget.dataset.cid)
    const cid = parseInt(e.currentTarget.dataset.cid, 10);

    let competition;
    if (cid > 0) {
      competition = this.competitions.find(c => c.cid === cid);
    } else {
      competition = this.new;
    }
    if (competition !== undefined && competition.administrator > 0) {
      this.selectedUser = competition.administrator;
    }
  }
  _maybeDelete(e) {
    e.stopPropagation();
    const cid = parseInt(e.currentTarget.dataset.cid,10);
    const competition = this.competitions.find(comp => comp.cid === cid);
    if (competition !== undefined) {
      const named = `the Competition named "${competition.name}"`
      this.deleteCid = cid;
      this.dispatchEvent(new DeleteRequest(named));
    }
  }
  _newAdministrator(e) {
    e.stopPropagation();

    const cid = e.currentTarget.dataset.cid;
    const competition = this.competitions.find(comp => comp.cid.toString() === cid);
    if (competition !== undefined) {
      competition.administrator = this.selectedUser;
      const input = e.currentTarget.parentElement.querySelector('fm-input');
      if (input.validate()) {
        this.dispatchEvent(new CompetitionChanged({cid: cid, adm: this.selectedUser}));
      }
    }
  }
  _newCompetition(e) {
    e.stopPropagation();
    if (this.newName.validate()) {
      if (this.new.administrator === 0) {
        this.newName.invalid = true;
        this.requestUpdate();
      } else {
        this.dispatchEvent(new CompetitionCreate({name: this.new.name, administrator: this.new.administrator}))
      }
    }
  }
  _newName(e) {
    e.stopPropagation();
    this.new.name = e.changed; //no need to force an render update for this.
  }
  _promote(e) {
    e.stopPropagation();
    switchPath('/gadm/promote');
  }
  _sendEmail(e) {
    e.stopPropagation();
    switchPath('/gadm/email');
  }
  _toggleSelected(e) {
    e.stopPropagation();
    const user = this.users.find(user => user.uid.toString() === e.currentTarget.dataset.uid);
    if (user !== undefined) {
      user.selected = !user.selected;
      if (user.selected) {
        this.selectedUser = user.uid;
        //if we selected this user , we need to make sure none of the other users is selected.
        for(const u of this.users) {
          if (u.selected && u.uid !== user.uid) u.selected = false;
        }
      } else {
        this.selectedUser = 0;
      }
    }
  }
}
customElements.define('gadm-home', GadmHome);