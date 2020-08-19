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

class WaitingIndicator extends LitElement {
  render() {
    return html`
      <style>
        :host {
          position:fixed;
          top: calc(50% - 32px);
          left: calc(50% - 32px);
          z-index: 5;
        }
        .spinner {
          display: inline-block;
          position: relative;
          width: 64px;
          height: 64px;
        }
        .spinner div {
          animation: spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          transform-origin: 32px 32px;
        }
        .spinner div:after {
          content: " ";
          display: block;
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-color);
          margin: -3px 0 0 -3px;
        }
        .spinner div:nth-child(1) {
          animation-delay: -0.036s;
        }
        .spinner div:nth-child(1):after {
          top: 50px;
          left: 50px;
        }
        .spinner div:nth-child(2) {
          animation-delay: -0.072s;
        }
        .spinner div:nth-child(2):after {
          top: 54px;
          left: 45px;
        }
        .spinner div:nth-child(3) {
          animation-delay: -0.108s;
        }
        .spinner div:nth-child(3):after {
          top: 57px;
          left: 39px;
        }
        .spinner div:nth-child(4) {
          animation-delay: -0.144s;
        }
        .spinner div:nth-child(4):after {
          top: 58px;
          left: 32px;
        }
        .spinner div:nth-child(5) {
          animation-delay: -0.18s;
        }
        .spinner div:nth-child(5):after {
          top: 57px;
          left: 25px;
        }
        .spinner div:nth-child(6) {
          animation-delay: -0.216s;
        }
        .spinner div:nth-child(6):after {
          top: 54px;
          left: 19px;
        }
        .spinner div:nth-child(7) {
          animation-delay: -0.252s;
        }
        .spinner div:nth-child(7):after {
          top: 50px;
          left: 14px;
        }
        .spinner div:nth-child(8) {
          animation-delay: -0.288s;
        }
        .spinner div:nth-child(8):after {
          top: 45px;
          left: 10px;
        }
        @keyframes spinner {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      </style>
      ${cache(this.waiting ? html`
        <div class="spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
      `: '')}

    `;
  }
  static get properties() {
    return {
      waiting: {type: Boolean}
    };
  }
  constructor() {
    super();
    this.waiting = false;
  }
}
customElements.define('waiting-indicator', WaitingIndicator);
