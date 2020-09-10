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
    return [page,css`
      :host {
        --icon-size: 16px;
        height: 100%;
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
    `];
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
          height: 100%;
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
            <li>When showing competition data, the first part of the url will be the id of the competition.  Other pages (such as this one) do not.</li>
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
          <p>The lists below describe the various urls, what is shown on the page when that url is selected, and where you go when you click on
          one of the items on the page.  These will be shown like this<strong>/:cid/rounds/:rid/match</strong>. Those segments (split with '/') that
          start with a ':' means that is a parameter, So the actual url may be <strong>/18/rounds/1/match</strong>, which means that the page
          is showing details of competition no 18 (2020 competition) round no 1. This page will show your picks, allowing you to change them if 
          that is still possible.</p>
          <ul>
            <li><strong>/</strong> or <strong>/:cid</strong>. This is the home page.  Although the url exists, ultimately you can't stop here and you
            will be immediately routed elsewhere.  Normally that will be <strong>/rounds/:rid</strong> where ":rid" is the latest open round, however
            if no round exists it will look to <strong>/teams</strong> page.
            <li><strong>/:cid/scores</strong> - will show the summary scores for each user in the competition followed further down the page with
            each of the rounds of the competition with the scores for all of the users for each round. Clicking on a particular round will take
            you to <strong>/:cid/round/:rid</strong></li>
            <li><strong>/:cid/rounds/:rid</strong> - will show details of the round.  If this is a bonus question round, the answers will be provided
            with the correct one marked, and below that a list of all the users and there answers to the question.  Below that will be the matches
            (ordered by match time) and below each match will be the users picks and results.</li>
            <li><strong>/:cid/rounds/:rid/bonus</strong>is a page to allow you to select the answer to the bonus question. You get to it by
            clicking on the <material-icon>rule</material-icon> icon.</li>
            <li><strong>/:cid/rounds/:rid/match</strong>is a page to allow you to make your match picks.  You get to it by clicking on the
            <material-icon>create</material-icon> icon.</li>

            <li><strong>/:cid/teams</strong> - will show a list of teams in the competition. The teams are organised by conference and then by division.  Each team shows whether it made the playoff and the score received if you selected that team.  Below each division is a list of users and their playoff picks. At the start of each conference each user has a line just highlighting their conferene and total playoff picks.</li>
            <li><strong>/:cid/teams/user</strong> - allows you to make your playoff picks.  </li>
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