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

import './fm-page.js';
import emoji from '../styles/emoji.js';
import page from '../styles/page.js';
import button from '../styles/button.js';
import api from '../modules/api.js';

/*
     <approve-home>
*/
class ApproveHome extends LitElement {
  static get styles() {
    return [page,button,emoji,css``];
  }
  static get properties() {
    return {
      members: {type: Array},
      selectedMember: { type: Number },
    };
  }
  constructor() {
    super();
    this.members = [];
    this.selectedMember = 0;
    this._deleteReply = this._deleteReply.bind(this);
    this.deleteUid = 0;
  }
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('delete-reply', this._deleteReply);
    this.deleteUid = 0;
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('delete-reply', this._deleteReply);
  }
  update(changed) {
    super.update(changed);
  }
  firstUpdated() {
  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`
      <style>
        .member {
          display: flex;
          flex-direction: column;
          margin: 10px;
          padding: 5px;
          border: 2px solid var(--accent-color);
          border-radius: 5px;
          box-shadow: 1px 1px 3px 0px var(--shadow-color);

        }
        .member:not(:last-of-type) {
          border-bottom: 1px dotted var(--accent-color);
        }
        .row1 {
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }
      </style>
      <fm-page id="page" heading="New Member Approval">
        <section class="scrollable">
          ${cache(this.members.map(member => html`
            <section class="member" data-uid=${member.uid} @click=${this._toggleSelected}>
              <div class="row1">
                <div class="em">${member.email}</div>
                <material-icon class="us">${member.selected ? 'check_box' : 'check_box_outline_blank'}</material-icon>
              </div>
              <div class="emoji reason">${member.reason}</div>
              

            </section>
          `))}
        </section>
        <button slot="action" @click=${this._accept}>Accept Selected</button>
        <button slot="action" @click=${this._reject}>Reject Selected</button>
        <button slot="action" @click=${this._query}>Query Selected</button>
      </fm-page>
    `;
  }
  async _accept(e) {
    e.stopPropagation();
    const response = await api('approve/member_approved', {uid: this.selectedMember}); 
    this.members = response.members;
  }
  _deleteReply(e) {
    e.stopPropagation();
    //just receeving this means go ahead
    if (this.deleteUid!== 0) {
      this.selectedMember = 0;
      this.dispatchEvent(new CompetitionDelete(this.deleteCid));
    }
  }
  _reject(e) {
    e.stopPropagation();

  }
  _toggleSelected(e) {
    e.stopPropagation();
    const member = this.members.find(member => member.uid.toString() === e.currentTarget.dataset.uid);
    if (member !== undefined) {
      member.selected = !member.selected;
      if (member.selected) {
        this.selectedMember = member.uid;
        //if we selected this member , we need to make sure none of the other members is selected.
        for (const u of this.members) {
          if (u.selected && u.uid !== member.uid) u.selected = false;
        }
      } else {
        this.selectedMember = 0;
      }
    }
  }


}
customElements.define('approve-home', ApproveHome);