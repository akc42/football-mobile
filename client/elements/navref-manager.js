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
import { LitElement, html,css } from '../libs/lit-element.js';
import {cache} from '../libs/cache.js';

import './fm-page.js';
import page from '../styles/page.js';
import { MenuAdd } from '../modules/events.js';
import global from '../modules/globals.js';
import './material-icon.js';

/*
     <navref-manager>
*/
class NavrefManager extends LitElement {
  static get styles() {
    return [page,css``];
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
    this.dispatchEvent(new MenuAdd('close'));
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
          --icon-size: 16px;
        }
        h1 {
          font-size:12px;
          font-weight: bold;
        }
        h2 {
          font-size:10px;
          font-weight: bold;
        }
        p, li {
          font-size:12px;
          font-weight: normal;
        }

      </style>
      <fm-page id="page" heading="Navigation Reference">
        <section class="scrollable">
          <h1>Main Principals</h1>
          <ul>
            <li>Before you are signed in there is no url beyond the main site address shown</li>
            <li>After you are signed in the url shows where you are in the application. A <material-icon>menu</material-icon> button appears on the main header bar.</li>
            <li>When showing competition data, the first part of the url will be the id of the competion.  Other pages (such as this one) do not.</li>
            <li>Competition data comes in three main sections:-
              <ol>
                <li>Scores - The user scores</li>
                <li>Rounds - The detail of rounds</li>
                <li>Teams - The details of teams and playoffs</li>
              </ol>
              The first part of the url reflects that.</li>
            <li>When inside a section and you are not at the top level of that section, a <material-icon>reply</material-icon> button appears on the main bar next to the menu button.  Clicking on this will take you one level up the hierarchy.</li>
            <li>If a page shows a list of items, generally clicking on one of the items will give you more detail about the item you clicked on.</li>
            <li>If there is a <material-icon>comment</material-icon> (comment) icon on the page clicking on it will bring up an overlay showing the comment text.</li>
          </ul>

          <h1>URL Reference</h1>
          <p>The lists below describe the various urls, what is shown on the page when that url is selected, and where you go when you click on one of the items on the page.  These will be shown like this<strong>/:cid/round/:rid/user/:uid</strong>. Those segments (split with '/') that start with a ':' means that is a parameter, So the actual url may be <strong>/17/round/20/user/4</strong>, which means that the page is showing details of competition no 17 (2019 competition) round no 20 (superbowl), user no 4 (me, Alan).  This page will show all my match picks.</p>
          <ul>
            <li><strong>/:cid/scores</strong> - will show the summary scores for each user in the competition. Clicking on a user will take you to 
              <strong>/:cid/scores/user/:uid</strong></li>
            <li><strong>/:cid/scores/user/:uid</strong> - will show the individual round scores for each of the rounds in the competion for that particular user. Clicking on a particular round will take you to <strong>/:cid/round/:rid</strong></li>
            <li><strong>/:cid/round/:rid</strong> - will show details of the round and then lists all users in the competition, with scores for that particular round. Clicking on a user will take you to <strong>/:cid/round/:rid/user/:uid</strong> for that particular user.</li>
            <li><strong>/:cid/round/:rid/user/:uid</strong> - will show details of the round and the user bonus pick (if a bonus question round), and a list of matches in the round, together with the results and picks for that user.  Note - if the user is <strong>you</strong> and the round is still open for selecting which answer to the bonus question is to be made, this can be changed.  Also if any match is still open , clicking on the approprate part of the match will select either the match result pick, or the under over result selection.</li>
            <li><strong>/:cid/teams</strong> - will show a list of teams in the competition. The teams are organised by conference and then by division.  Each team shows whether it made the playoff and the score received if you selected that team.  Clicking on a particular division, will take you to
            <strong>/:cid/teams/div/:confid/:divid</strong></li>
            <li><strong>/:cid/teams/div/:confid/:divid</strong> - will show a list of users and for each one it all teams in that division and the picks that user has made.  Clicking on the particular user will take you to <strong>/:cid/teams/user/:uid</strong></li>
            <li><strong>/:cid/teams/user/:uid</strong> - will show for that particular user a list of all divisions, and the teams in that division with an indication by them if it is one of their playoff picks.  If that user is <strong>you</strong> and the picks are still open you can toggle the selections to modify you picks.</li>
            <li><strong>/:cid/register</strong> - a page where you can register for the next competiion</li>
            <li><strong>/:cid/soon</strong> - the page you go to when a competition exists but is not yet open.</li>
            <li><strong>/profile</strong>A page where you can edit your profile.  Changes of e-mail will require you to validate your e-mail address again.</li>
            <li><strong>/navref</strong> - this page.</li>
            </li><strong>/icon</strong> - shows the meaning of the various icons shown in the application.</li>     
          </ul>
        </section>
      </fm-page>
    `;
  }
}
customElements.define('navref-manager', NavrefManager);