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

import './football-page.js';
import page from '../styles/page.js';
import button from '../styles/button.js';
import opids from '../styles/opids.js';

import {switchPath} from '../modules/utils.js';
import global from '../modules/globals.js';

import './fm-checkbox.js';
import './fm-input.js';
import './calendar-input.js';
import './round-header.js';
import { DeleteRequest,RoundChanged, OptionCreate , OptionDelete} from '../modules/events.js';


/*
     <admin-round-round-home>: Allows Selection of Other Rounds
*/
class AdminRoundRoundHome extends LitElement {
  static get styles() {
    return [page, button, opids, css`
      :host {
    position: relative;
  }
  input {
    opacity: 0;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;
  }

  label span {
    border-radius: 50%;
    border: 2px solid var(--color);
    display: inline-block;
    margin-right: 0.5em;
    vertical-align: bottom;
    width: 12px;
    height: 12px;
    position: relative;
  }
  input:checked + label span {
    border-color: var(--accent-color);
  }
  input:checked + label span::before {
    content: "";
    display: block;
    width: inherit;
    height: inherit;
    border-radius: inherit;
    position: absolute;
    transform: scale(0.6);
    transform-origin: center center;
    background-color: var(--accent-color);
  }
      section.scrollable {
        display: grid;
        grid-gap: 2px;
        grid-template-columns: var(--admin-name-length) 1fr;
        grid-template-areas:
          "name rid"
          "name open"
          "points ou"
          "comment comment"
          "bonus bonus";
        justify-items: stretch;
        align-items: flex-start;
      }
      #name {
        grid-area:name;
      }
      #rid {
        grid-area: rid;
        font-size: 2rem;
        font-weight: bold;
        text-align: right;
      }
      #comment {
        grid-area: comment;
      }
      #open {
        grid-area: open;
      }
      #ou {
        grid-area: ou;
      }
      #points {
        grid-area: points;
        --input-width: var(--points-input-width);
      }
      #bonus {
        grid-area: bonus;
        display: grid;
        grid-gap: 2px;
        grid-template-columns: repeat(2, 1fr);
        grid-template-areas:
          "bpoints validq"
          "deadline optionsel"
          "question optionsel";
        justify-items: flex-start;

      }
      #validq {
        grid-area: validq;
      }
      #deadline {
        grid-area: deadline;
      }
      #bpoints {
        grid-area: bpoints;
        --input-width: var(--points-input-width);
      }
      #question {
        grid-area: question;
      }
      #optionsel {
        grid-area: optionsel;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: stretch;
      }
      hr {
        width: 100%;
      }
      .optionitem {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
        .add {
          color: var(--create-item-color); 
          cursor: pointer;
        }
        .del {
          cursor: pointer;
        }

    `];
  }
  static get properties() {
    return {
      round: {type: Object},
      options: {type: Array},
      opid: {type: Number},
      label: {type: String}, //label for opid
      next: { type: Number }, //Next rid (unless 0 when none)
      previous: { type: Number } //previous rid (unless 0 when none)

    };
  }
  constructor() {
    super();
    this.round = {rid: 0, name: ''}
    this.options = [];
    this.opid = 1;
    this.label = '';
    this.deleteopid = null;
    this.next = 0;
    this.previous = 0;
  }
  connectedCallback() {
    super.connectedCallback();
    this.deleteopid = null;
    this.addEventListener('delete-reply', this._deleteReply);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('delete-reply', this._deleteReply);
  }
  update(changed) {
    if (changed.has('options')) {  
      this.options = this.options.sort((a,b) => a.opid - b.opid); //ensure we are in ascending order
      if (this.options.length > 0) {
          this.opid = this.options.length + 1; //start be assuming it will be one above the end
          if (this.options.length === 1) {
            if (this.options[0].opid !== 1) this.opid = 1; //only one and the first is not 1 so we can use the one slot
          } else {
            for(let i = 0; i < this.options.length; i++) {
              if (this.options[i].opid > (i + 1)) {
                //this is the first time it occurs = so we just found the first gap to use
                this.opid = i + 1;
                break;
              }
            }
          }
      } else {
        this.opid = 1;
      }
    }
    super.update(changed);
  }
/*  firstUpdated() {
    this.newOption = this.shadowRoot.querySelector('#newoption');
  } */
  updated(changed) {
    if(changed.has('round') && this.round.valid_question === 1) {
      this.newOption = this.shadowRoot.querySelector('#newoption');
    }
    super.updated(changed);
  }
  render() {
    return html`

      <football-page id="page" heading="Round Details" nohead>
        <round-header slot="heading" .round=${this.round} .previous=${this.previous} .next=${this.next}></round-header>
        <section class="scrollable">
          <div id="rid">${this.round.rid}</div>
          <fm-input 
            id="name" 
            name="name" 
            label="Round Name" 
            required 
            .value=${this.round.name}
            @blur=${this._nameChange}></fm-input>
          <fm-checkbox 
            id="open"
            name="open" 
            ?value=${this.round.open === 1}
            @value-changed=${this._openChange}>Round Open</fm-checkbox>
          <fm-checkbox 
            id="ou" 
            name="ou"
            ?value=${this.round.ou_round === 1}
            @value-changed=${this._ouChange}>O/U Round</fm-checkbox>
          <fm-input 
            id="points"
            name="points"
            type="number"
            label="Match Pick Points"
            required
            min="1"
            step="1"
            max="50"
            message="Between 1 amd 50" 
            .value=${this.round.value}
            @blur=${this._pointsChange}></fm-input>
          <fm-input
            id="comment"
            name="comment"
            label="Comment"
            textArea
            .value=${this.round.comment}
            @blur=${this._commentChange}></fm-input>
          <section id="bonus">
            <fm-checkbox 
              id="validq" 
              name="validq" 
              ?value=${this.round.valid_question === 1}
              @value-changed=${this._validqChanged}>Bonus Question Valid</fm-checkbox>
            ${cache(this.round.valid_question === 1 ? html`
              <fm-input
                id="bpoints"
                name="bpoints"
                type="number"
                label="Bonus Question Points"
                required
                min="1"
                step="1"
                max="50"
                message="Between 1 amd 50"
                .value=${this.round.bvalue}
                @blur=${this._bpointsChange}></fm-input>
              <calendar-input 
                id="deadline"
                name="deadline"
                withTime
                label="Bonus Deadline"
                .value=${this.round.deadline}
                @value-changed=${this._deadlineChanged}></calendar-input>
              <fm-input
                id="question"
                name="question"
                label="Bonus Question"
                textArea
                rows="10"
                .value=${this.round.question}
                @blur=${this._questionChange}></fm-input>
              <form id="optionsel" @change=${this._radioChange}>

                <fm-input
                  id="newoption"
                  name="option"
                  label="New Option"
                  .value=${this.label}
                  message="At least character"
                  @value-changed=${this._newOptionLabel}></fm-input>            
                <div class="optionitem">
                  <input 
                    type="radio" 
                    id="o0" 
                    value="0" 
                    ?checked=${this.round.answer === null || this.round.answer <= 0} 
                    name="options">
                  <label for="o0"><span></span>No Answer Yet</label>
                  <material-icon class="add" @click=${this._newOption}>note_add</material-icon> 
                </div>
                <hr/>
                ${cache(this.options.map(o => html`
                  <div class="optionitem">
                    <input type="radio" id="o${o.opid}" .value=${o.opid} name="options" ?checked=${o.opid === this.round.answer}>
                    <label for="o${o.opid}"><span></span> <material-icon class="C${o.opid%6}">stop</material-icon> ${o.label}</label>
                    <material-icon class="del" @click=${this._maybeDelete} data-opid="${o.opid}">close</material-icon>
                  </div>
                `))}
              </form>
            `:'')}
          </section>
              
        </section>
        <button slot="action" @click=${this._matches}><material-icon>sports_football</material-icon> Matches</button>
        <button slot="action" @click=${this._userPicks}><material-icon>check_circle</material-icon> Do User Picks</button>
      </football-page>
    `;
  }
  _bpointsChange(e) {
    e.stopPropagation();
    const target = e.currentTarget;
    if (target.validate()) {
      this.round.bvalue = parseInt(target.value,10);
      this.dispatchEvent(new RoundChanged({ rid: this.round.rid, bvalue: this.round.bvalue }));
    }

  }
  _commentChange(e) {
    e.stopPropagation();
    if (this.round.comment !== e.currentTarget.value) {
      this.round.comment = e.currentTarget.value;
      this.dispatchEvent(new RoundChanged({ rid: this.round.rid, comment: this.round.comment }));
    }
  }
  _deadlineChanged(e) {
    e.stopPropagation();
    if (this.round.deadline !== e.changed) {
      this.round.deadline = e.changed;
      this.dispatchEvent(new RoundChanged({ rid: this.round.rid, deadline: this.round.deadline }));
    }
  }
  _deleteReply(e) {
    e.stopPropagation();
    //just recieving this means go ahead
    if (this.deleteopid) {
      this.dispatchEvent(new OptionDelete({opid:this.deleteopid}));
      this.deleteopid = null;
    }
  }
  _matches(e) {
    e.stopPropagation();
    switchPath(`${global.cid}/admin/rounds/round/${this.round.rid}/match`);
  }
  _maybeDelete(e) {
    e.stopPropagation();
    const opid = parseInt(e.currentTarget.dataset.opid, 10);
    const option = this.options.find(o => o.opid === opid);
    const named = `the Option Answer "${option.label}"`
    this.deleteopid = opid;
    this.dispatchEvent(new DeleteRequest(named));
  }

  _nameChange(e) {
    e.stopPropagation();
    if (e.currentTarget.value !== this.round.name) {
      this.round.name = e.currentTarget.value;
      this.dispatchEvent(new RoundChanged({rid:this.round.rid, name: this.round.name}));
    }
  }

  _newOption(e) {
    e.stopPropagation();
    if (this.label.length > 0) {
      this.dispatchEvent(new OptionCreate({opid: this.opid, label: this.label}));
      this.label = '';
    } else {
      this.newOption.invalid = true;
    }
  }
  _newOptionLabel(e) {
    e.stopPropagation();
    this.label = e.currentTarget.value;
    if (this.label.length > 0) this.newOption.invalid = false;
  }
  _openChange(e) {
    e.stopPropagation();
    this.round.open = e.changed ? 1 : 0;
    this.dispatchEvent(new RoundChanged({rid: this.round.rid, open: this.round.open}));
  }
  _ouChange(e) {
    e.stopPropagation();
    this.round.ou_round = e.changed ? 1 : 0;
    this.dispatchEvent(new RoundChanged({ rid: this.round.rid, ou_round: this.round.ou_round }));
  }
  _pointsChange(e) {
    e.stopPropagation();
    const target = e.currentTarget;
    if (target.validate()) {
      this.round.value = parseInt(target.value,10);
      this.dispatchEvent(new RoundChanged({ rid: this.round.rid, value: this.round.value }));
    }
    
  }
  _questionChange(e) {
    e.stopPropagation();
    if(this.round.question !== e.currentTarget.value) {
      this.round.question = e.currentTarget.value;
      this.dispatchEvent(new RoundChanged({ rid: this.round.rid, question: this.round.question }));
    }
  }
  _radioChange(e) {
    e.stopPropagation();
    this.round.answer = e.target.value;
    this.dispatchEvent(new RoundChanged({rid:this.round.rid, answer: this.round.answer}));
  }
  _userPicks(e) {
    e.stopPropagation();
    switchPath(`/${global.cid}/rounds/${this.round.rid}`,{admin: 1});
  }
  _validqChanged(e) {
    this.round.valid_question = e.changed ? 1 : 0;
    this.dispatchEvent(new RoundChanged({ rid: this.round.rid, valid_question: this.round.valid_question }));
  }
}
customElements.define('admin-round-round-home', AdminRoundRoundHome);