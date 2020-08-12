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

import global from '../modules/globals.js';


/*
     <app-page>
*/
class FmPage extends LitElement {
  static get styles() {
    return css`
      :host{
        height:100%;
        display: flex;
        flex-direction:column;
        max-width: 600px;
        justify-content: start;
        padding:10px;
        box-sizing:border-box;
      }
      header {
        display: flex;
        flex-direction: row;
        flex:0 1 0;
      }
      img {
        background-color: var(--color);
        padding: 3px;
        border-radius:2px;
      }
      #hcont {
        margin-left: 10px;
        font-weight: bold;
        display:flex;
        flex-direction: column;
        justify-content:flex-start;
        flex: 1 1 auto;
        align-items: center;
      }
      header .heading {
        font-size:18px;
        text-transform: uppercase;
        flex:1 1 auto;

      }
      header .subheading {
        font-size: 10pt;
        flex:1 1 auto;

      }
      section {
        flex: 1 0 0;
        display: flex;
        flex-direction: column;
        overflow-y: auto;
        scroll-snap-type: y mandatory;
      }

      .action {
        display: flex;
        width:100%;
        flex-direction:row;
        flex-wrap: wrap;
        justify-content: space-evenly;
        flex:0 1 auto;
      }

      @media (min-width: 500px) {

        :host {
          margin: 40px auto 40px auto;
          max-height: 100%;
          border-radius: 10px;
          box-shadow: 0px 0px 38px -2px var(--shadow-color);
          padding: 20px;
          min-width: 500px;
        }
      }
      @media (max-width: 300px) {
        header {
          transform: scale(0.75);
          transform-origin: left top;
        }
      }
    `;
  }
  static get properties() {
    return {
      heading: {type: String}
    };
  }
  constructor() {
    super();
    this.heading='';
  }
  render() {
    return html`
      <header>
        <img src="${global.siteLogo}" height="64px"/>
        <div id="hcont">
          <div class="heading">${this.heading}</div>
          <div class="subheading"><slot name="subheading"></slot></div>
        </div>
      </header>
      <section><slot class="container"></slot></section>
  
      <div class="action"><slot name="action"></slot></div>
    `;
  }
}
customElements.define('fm-page', FmPage);