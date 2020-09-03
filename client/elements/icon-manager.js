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

import './fm-page.js';
import page from '../styles/page.js';
import './material-icon.js';
import './fm-input.js';


/*
     <icon-manager>
*/
class IconManager extends LitElement {
  static get styles() {
    return [page, css``];
  }
  static get properties() {
    return {
    
    };
  }
  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
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
        :host {
          --icon-size: 20px;
        }
        .item {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          height: 26px;
          margin: 10px 0;
        }

        .icon {
          width: 20px;
          height: 20px;
          margin-right: 20px;
          padding:3px;
          
        }
        .menu {

          background-color: var(--header-icon-background-color);
          color: var(--header-icon-color);
          border: none;
          border-radius: 5px;
          box-shadow: 2px 2px 5px 4px var(--shadow-color);
        }
       .unknown {
          color: var(--fm-indeterminate-pick);
        }
        .correct {
          color: var(--fm-correct-pick);
        }
        .incorrect {
          color: var(--fm-incorrect-pick);
        }
        .poff {
          color: var(--fm-in-playoff)
        }
        .result {
          color: var(--fm-win-color);
        }
        .at {
          background-color: var(--fm-pick-open);
          font-size: 20px;
          align-self: stretch;
          vertical-align: center;
          text-align: center;

        }

        .editable {
          color: var(--fm-editable-comment);
        }
        .fixed {
          color: var(--fm-fixed-comment);
        }
        
        fm-input {
          width: 230px;
        }
        .panel {
          width: 12rem;
          font-family:'NotoColorEmoji', 'Roboto Mono', monospace;
          background-color: var(--background-color);
          color: var(--color);
          border: none;
          border-radius: 5px;
          box-shadow: 0 0 40px var(--shadow-color), 0 0 10px var(--shadow-color);
          margin:10px;
        }
        .em {
          color: var(--emoji-button-color);
        }

      </style>
      <fm-page id="page" heading="Icon Meanings">
        <p>There are a number of icons that are used throughout the application which indicate useful information in the limited space that we have available. The purpose of this page is to show these icons and explain what they mean.</p>

        <div class="item">
          <div class="icon menu"><material-icon>menu</material-icon></div>
          <div class="description">Main menu button</div>
        </div>
        <div class="item">
          <div class="icon menu"><material-icon>reply</material-icon></div>
          <div class="description">Move one level up url hierachy </div>
        </div>
        <div class="item">
          <div class="icon unknown"><material-icon>check_circle</material-icon></div>
          <div class="description">Pick with unknown result</div>
        </div>
        <div class="item">
          <div class="icon correct"><material-icon>check_circle</material-icon></div>
          <div class="description">Pick with correct result</div>
        </div>
        <div class="item">
          <div class="icon incorrect"><material-icon>check_circle</material-icon></div>
          <div class="description">Pick with incorrect result</div>
        </div>
        <div class="item">
          <div class="icon correct"><material-icon>offline_pin</material-icon></div>
          <div class="description">Pick made by admin (colors as per standard pick)</div>
        </div>
        <div class="item">
          <div class="icon correct"><material-icon>alarm_on</material-icon></div>
          <div class="description">Late pick by admin (colors as per standard pick)</div>
        </div>
        <div class="item">
          <div class="icon poff"><material-icon>emoji_events</material-icon></div>
          <div class="description">Team is in the playoffs.</div>
        </div>
        <div class="item">
          <div class="icon result"><material-icon>emoji_events</material-icon></div>
          <div class="description">Team won match.</div>
        </div>
        <div class="item">
          <div class="icon editable"><material-icon>comment</material-icon></div>
          <div class="description">Click to edit comment</div>
        </div>

        <div class="item">
          <div class="icon fixed"><material-icon>comment</material-icon></div>
          <div class="description">Click to show comment</div>
        </div>
        <div class="item">
          <div class="icon approve"><material-icon>grading</material-icon></div>
          <div class="description">Member Approval Capability</div>
        </div>
        <div class="item">
          <div class="icon admin"><material-icon>font_download</material-icon></div>
          <div class="description">Competition Admin Function</div>
        </div>
        <div class="item">
          <div class="icon gadm"><material-icon>public</material-icon></div>
          <div class="description">Global Admin Function</div>
        </div>

        <div class="item">
          <div class="icon at">@</div>
          <div class="description">Match open for making picks</div>
        </div>

        <p>Finally the following is an example of text input box.  It shows a small emoji icon to the top right.  
        If you click on the <material-icon  class="em"> insert_emoticon</material-icon> icon it puts up a panel
        like that shown below just below the input area.</p>
        <fm-input textarea label="Text Input"></fm-input>

        <div class="panel">
          <span @click=${this._getChar}>🍌</span>
          <span @click=${this._getChar}>🙇</span>
          <span @click=${this._getChar}>😖</span>
          <span @click=${this._getChar}>👋</span>
          <span @click=${this._getChar}>🐒</span>
          <span @click=${this._getChar}>🥂</span>
          <span @click=${this._getChar}>😢</span>
          <span @click=${this._getChar}>🤔</span>
          <span @click=${this._getChar}>😠</span>
          <span @click=${this._getChar}>🤩</span>
          <span @click=${this._getChar}>🙄</span>          
          <span @click=${this._getChar}>🥺</span>
          <span @click=${this._getChar}>👐</span>
          <span @click=${this._getChar}>😉</span>
          <span @click=${this._getChar}>😠</span>
          <span @click=${this._getChar}>🤯</span>
          <span @click=${this._getChar}>🥒</span>
          <span @click=${this._getChar}>😾</span>
          <span @click=${this._getChar}>🤣</span>
          <span @click=${this._getChar}>😈</span>
          <span @click=${this._getChar}>😮</span>
          <span @click=${this._getChar}>🙏</span>
          <span @click=${this._getChar}>👍</span>
          <span @click=${this._getChar}>❤️</span>
          <span @click=${this._getChar}>😱</span>
          <span @click=${this._getChar}>🛌</span>
                  
        </div>
        <p>Click on an icon and it will be automatically added into the text area just were the cursor was last positioned.</p>
      </fm-page>
    `;
  }
}
customElements.define('icon-manager', IconManager);