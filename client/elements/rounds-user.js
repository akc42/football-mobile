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
import {cache} from '../libs/cache.js';
import {classMap} from '../libs/class-map.js';

import './fm-page.js';
import './list-manager.js';
import './rounds-user-item.js';
import './material-icon.js';
import './user-pick.js';
import './comment-button.js';

import page from '../styles/page.js';
import tooltip from '../styles/tooltip.js';
import emoji from '../styles/emoji.js';

import { switchPath } from '../modules/utils.js';
import global from '../modules/globals.js';
import { OptionComment } from '../modules/events.js';

/*
     <rounds-user>
*/
class RoundsUser extends LitElement {
  static get styles() {
    return [page, tooltip,emoji];
  }
  static get properties() {
    return {
      user: {type: Object}, 
      round: {type: Object},
      isOpen: {type: Boolean} //if deadline is not yet past for option picks
    };
  }
  constructor() {
    super();
    this.user = {uid:0,name:'', picks: []};
    this.round = {rid: 0, name: '', matches:[], valid_question: 0}
    this.timer = 0;
  }
  connectedCallback() {
    super.connectedCallback();
    if (this.timer === 0 && this.round.valid_question === 1) {
      const secstogo  = this.round.deadline - Math.floor(new Date().getTime()/1000);
      if (secstogo > 0) {
        this.isOpen = true
        this.timer = setTimeout(() => {
          this.isOpen = false;
          this.timer = 0;
        },secstogo * 1000);
      }
    }
  }
  disconnnectedCallback() {
    super.disconnnectedCallback();
    if (this.timer > 0) {
      clearTimeout(this.timer);
      this.timer = 0;
    }
  }

  updated(changed) {
    if (changed.has('round') && this.round.valid_question === 1) {
      if (this.timer !== 0) {
        clearTimeout(this.timer);
        this.timer = 0;
      }
      const secstogo = this.round.deadline - Math.floor(new Date().getTime() / 1000);
      if (secstogo > 0) {
        this.isOpen = true
        this.timer = setTimeout(() => {
          this.isOpen = false;
          this.timer = 0;
        }, secstogo * 1000);
      }
    }

    super.update(changed);  
  }

  render() {
    return html`
      <style>
      
        .container{
          border:2px solid var(--app-accent-color);
          border-radius: 5px;
          box-shadow: 1px 1px 3px 0px rgba(0,0,0,0.31);
          margin:5px 5px 5px 3px;
          display: grid;
          grid-gap:2px;
          grid-template-columns: 1fr 1fr;

        }
        .question, .label, .answer, .pick, .mp,.ou, .mt,.bs,.rs {
          padding:2px;
          text-align: center;
          vertical-align: center;
        }
        .question {
          grid-column:1;
          grid-row: 2 / 3;
        }
        .answers {
          grid-column: 2;
        }
        .container > ul {
          grid-column: 2;
          font-size: 10px;
        }
        .bs {
          grid-column: 2;
          grid-row: 3;
        }
        .poff, .opick {
          cursor:pointer;
        }
        .option, .answers {
          font-weight: bold;
        }

      </style>
      <fm-page id="page" heading="User Scores">
        <div 
          slot="heading" 
          data-tooltip="click for playoff info" 
          @click=${this._playoff} 
          class="poff"><strong>${this.user.name}</strong></div>
        <div slot="heading">${this.round.name}</div>
        <list-manager 
          custom="rounds-user-item"  
          .items=${this.round.matches}
          @comment-changed=${this._commentMatch}>
          <div slot="header" class="container">
              ${cache(this.round.valid_question === 1 ? html`
                <div class="option">Option Question</div>
                <div class="emoji question">${this.round.question}></div>
                <div class="answers">
                  <span>Answers</span> ${this.isOpen? html`<span>(Can still Pick)</span>`: ''}
                  <comment-button
                    .comment=${this.user.comment}
                    @comment-changed=${this._commentOption}
                    ?edit=${global.uid === this.user.uid && this.isOpen}></comment-button>
                </div>
                <ul class="${classMap({opick: this.isOpen && this.user.uid === global.uid})}">
                  ${this.round.options.map(option => html`
                    <li data-opid=${option.opid} @click=${this._makePick}>
                      <div class="label">${option.label}</div>
                      <div class="answer">${option.opid === this.round.answer? html`<material-icon>check</material-icon>`:''}</div>
                      <div class="pick">${this.user.opid === option.opid?html`<user-pick 
                        ?admin=${this.user.admin_made === 1}
                        ?correct=${this.user.opid === this.round.answer}
                        .made=${this.user.submit_time}
                        .deadline=${this.round.deadline}
                        ?result=${this.round.answer !== 0}></user-pick>`:''}</div>
                    </li>
                  `)}
                </ul>
                <div class="bs">Bonus Score: ${this.user.bscore}</div>
              `:'')}
              <div class="mp">Match Picks: ${this.user.pscore}</div>
              ${this.round.ou_round === 1 ? html`<div class="ou">OU Score: ${this.user.oscore} </div>`:''}
            <div class="mt">Match Total: ${this.user.mscore}</div>
            <div class="rs">Round Score: ${this.user.score}</div>
          </div>
        </list-manager>
      </fm-page>
    `;
  }
  _commentMatch(e) {
    e.stopPropagation()
    this.dispatchEvent()
  }
  _commentOption(e) {
    e.stopPropagation();
    this.dispatchEvent(new OptionComment(e.changed));  //convert to optionComment (only we know that is what it is)

  }
  _makePick(e) {
    if (this.isOpen && global.uid === this.user.uid) {
      this.dispatchEvent(new OptionPick(e.dataset.opid));
    }
  }
  _matchPick(e) {

  }
  _playoff(e) {
    e.stopPropagation();
    switchPath(`/teams/${this.user.uid}`);
  }
}
customElements.define('rounds-user', RoundsUser);