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
import {unsafeHTML} from '../libs/unsafe-html.js';
import {cache} from '../libs/cache.js';

import api from '../modules/api.js';
import { EmoticonSelected } from '../modules/events.js';


let emoticonPromise;




/*
     <emoticon-string>: This scans the string (provided in string property) for text of the form ':xxx' were xxx is one of
                        the valid codes in our emoticon table.  If found it converts said string in to 
                        <img src="data:image/png;base64,${icon}"/>, where icon is fetched from the database.  The result is encased in a span with class "es" to style the 
*/
class EmoticonString extends LitElement {
  static get styles() {
    return [];
  }
  static get properties() {
    return {
      tester: {type: String}, //the  reg ex tester for emoticons
      string: {type:String} //raw input string
    };
  }
  constructor() {
    super();
    this.tester = null;
    this.string = '';
    this._replacer = this._replacer.bind(this);
    //the first one of these that gets constructed will do this
    if (emoticonPromise === undefined) {
      emoticonPromise = api('user/emoticons');
    }
    emoticonPromise.then(response => {
      const codes = response.emoticons.map(e => e.code);
      this.tester = new RegExp(`:(${codes.join('|')})`,'g');
      this.emoticons = response.emoticons;
    });
  }
  render() {
    return html`
      <style>
        .es {
          font-size:10px;
        }
       </style>
      <span class="es">
        ${cache(unsafeHTML(this.string.replace(this.tester, this._replacer)))}
      </span>
    `;
  }

  _replacer(m,p) {
    const emoticon = this.emoticons.find(e => e.code === p );
    return `<img src="data:image/png;base64,${emoticon.icon}"/>`
  }
}



/*
     <emoticon-panel>
*/
class EmoticonPanel extends LitElement {
  static get styles() {
    return [];
  }
  static get properties() {
    return {
      emoticons:{type:Array}
    };
  }
  constructor() {
    super();
    this.emoticons = [];
    //the first one of these that gets constructed will do this
    if (emoticonPromise === undefined) {
      emoticonPromise = api('user/emoticons');
    }
    emoticonPromise.then(response => {
      this.emoticons = response.emoticons;
    });

  }
  render() {
    return html`
      <style>
      </style>
      <div class="container">
        ${cache(this.emoticons.map(emoticon => html`
          <div class="emoticon" data-code="${emoticon.code}" @click=${this._sendCode}>
            <img src="data:image/png;base64,${emoticon.icon}"/>
            <div>:${emoticon.code}</div>
          </div>
        `))}
      </div>
    `;
  }
  _sendCode(e) {
    e.stopPropagation();
    this.dispatchEvent(new EmoticonSelected(`:${e.dataset.code}`))
  }
}

customElements.define('emoticon-string', EmoticonString);
customElements.define('emoticon-panel', EmoticonPanel);