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

import './material-icon.js';
import { CommentRequest, CommentShow, ValueChanged, CommentChanged } from '../modules/events.js';

/*
     <comment-button>
*/
class CommentButton extends LitElement {
  static get styles() {
    return css`
      :host {
        --icon-size: 16px;
        display: flex;
        height: 16px;
        width:16px;
        cursor:pointer;
      }
      .nocomment {
        display: inline-block;
        height: 16px;
        width: 16px;
      }
      material-icon {
        color: var(--fm-fixed-comment);
      }
      material-icon.editable {
        color: var(--fm-editable-comment);
      
      }
    `;
  }
  static get properties() {
    return {
     comment: {type: String}, //comment so far (note no comment may be either zero length string OR null)
     edit: {type: Boolean}  //true of still possible to make a pick and add a comment
    };
  }
  constructor() {
    super();
    this.comment = '';
    this.edit = false;
  }
  render() {
    return html`
      ${cache((this.edit || (this.comment !== null && this.comment.length > 0)) ? html`
        <material-icon 
          ?outlined=${this.comment === null || this.comment.length === 0} 
          class="${classMap({editable: this.edit})}"
          @click=${this._display}
          @comment-reply=${this._reply}>comment</material-icon>
      `:html`<div class="nocomment"></div>`)}
    `;
  }
  _display(e) {
    e.stopPropagation();
    if (this.edit) {
      e.currentTarget.dispatchEvent(new CommentRequest(this.comment));
    } else {
      this.dispatchEvent(new CommentShow(this.comment));
    }
  }
  _reply(e) {
    e.stopPropagation();
    this.comment = e.comment;
    this.dispatchEvent(new CommentChanged(this.comment));
  }
}
customElements.define('comment-button', CommentButton);