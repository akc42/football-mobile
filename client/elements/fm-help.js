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

import './app-page.js';
import page from '../styles/page.js';

/*
     <fm-help>
*/
class FmHelp extends LitElement {
  static get styles() {
    return [page];
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
        h1 {
          font-size:12px;
          font-weight: bold;
        }
        h2 {
          font-size:10px;
          font-weight: bold;
        }
        p {
          font-size:12px;
          font-weight: normal;
        }
      </style>
      <app-page id="page" heading="Navigation Help">
        <h1>Introduction</h1>
        
        <p>Football Mobile has a number of challenges to overcome, in that it is designed to work on relatively
        small screens, yet has a lot of information to display.  As a result that way that one navigates between
        each page, where each page can only hold a limited about of information is crucial.</p>

        <p>The first and most important thing to say is that once you have logged in navigation is controlled by the url and will change
        as you move from page to page.  Football Mobile will ensure that browser history correctly reflects all the 
        changes in page as you move from one to another except in the specific case where the browser automatically changes the url
        rapidly for you, as a page has to remain on display for at least two seconds before it is remembered. The url will
        also generally carry specific parameters (such as a specific round to display when its not the default).  There
        are two pieces of information that are carried between pages - this are details about the current user and the id of the  
        competition - that is not carried in the url, but rather in cookies.</p>

        <p>The net result is that all navigation just involves changing the url that the browser is using, except during the logging in phase when for security reasons with do not reflect the process in the url.</p>

        <h1>How to Change the url</h1>
        
        <p>The url is also organised into a hierarchy.  So for instance /scores showes the overall scores for a competition, 
        and /scores/round will show the scores for the latest round in the competition and /scores/round/5 will show the score for 
        round 5 of the competition.</p>

        <p>There are just four ways in which user can navigate between pages.  These are:-
        <ol>
          <li>Use buttons on the page to click.  This will generally initiate (or abandon) an action and then navigate you to a follup up page.</li>
          <li>Use the back and forward buttons on the browser.  This is a simple mechansim that will take to back to a previous page, or (if you have already gone back) forward to a page you jumped back from.</li>
          <li>Use the <material-icon>reply</material-icon> if it is in the main application toolbar.  This will take you one level up the hierarary.  So for example of you were at url /scores/round/5, clicking the <material-icon>reply</material-icon> button will take you to url /scores/round.</li>
          <li>Use the <material-icon>menu</material-icon> button.  This will pop up a menu of options that you can take.</li>
          <li>If the current page has some form of list (of users, matches, team, rounds - etc) then clicking on one particular item of that list will take you to a page with more detailed information with that particular item the focus.</li>
        </ol>
        </p>

      
      </app-page>
    `;
  }
}
customElements.define('fm-help', FmHelp);