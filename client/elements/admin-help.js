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
import './material-icon.js';
import './fm-page.js';
import page from '../styles/page.js';


/*
     <admin-help>: Help Page for Admin
*/
class AdminHelp extends LitElement {
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
        material-icon {
          --icon-size: 16px;
        }
        .inheader {
          background-color: var(--accent-color);
          color: var(--accent-contrast-color);
          border-radius: 2px;
        }
        .round, .in {
          color: var(--item-present);
        } 
        .out {
          color: var(--item-not-present);
        }
      </style>
      <fm-page id="page" heading="Admin Help">
        <p>Just some brief notes that should help. Also read the "Icon Meanings" help page</p>
        <ul>
          <li>Global Admin has created the competition and assigned you as Administrator</li>
          <li>The main page is the basics of the competition. Some new concepts this year
            <ul>
              <li>Expected soon is an approximate date you think you will 'open' the competition. This will disappear when you open the competition.</li>
              <li>You can close a competition - this stops further registrations.  It should be closed when the season is over if not already.</li>
              <li>The registration text will become an un-editable panel when the competition is closed.</li>
              <li>You can set default values for Playoff picks, Match Picks and Round Bonus.  The actual values are initialised from these but you can change them.</li>
              <li>Locking the teams in the competition is remembered and has to be done before you can start constructing rounds</li>
            </ul>
          <li>Teams allows you to set teams in the competition and the score a user gets for a correct playoff Pick.  This initial setting is a copy of last years teams with your new default values. This is setup when you press the "Teams" button, so set the default first.</li>
          <li>At the bottom right of each team is a marker that says whether the team is has been elimiated or not.  Eliminated is shown
          as <material-icon class="out">format_clear</material-icon>, still remaining is <material-icon class="in">title</material-icon>.  Clicking on it will toggle it.</li>
          <li>Rounds lets you manage rounds.  If there are rounds, it will default to taking you to the last round, but you can back up (using the <material-icon class="inheader">reply</material-icon> button). This takes you to the page which lists the rounds and allows you to create a new one.</li>
          <li><material-icon class="round">question_answer</material-icon> in the header indicates this is a round with a bonus question.</li>
          <li><material-icon class="round">thumbs_up_down</material-icon> in the header indicates this is a round where over under selections happen.</li>
          <li>Match Management is a accessed via button on the Round Page. Clicking it will take you to a page where there is a section at the top
          listing matches (initially empty) showing matches in the round, and below that a list of teams in the competition not yet eliminated
          (see Team above).</li>
          <li>Clicking on the team will create a match with that team as the "Away" team.  Clicking on a second team will add it to the match.</li>
          <li>Each Match will provide the following:-
            <ul>
              <li>Clicking on the <material-icon>close</material-icon> below each team will remove them from the match.</li>
              <li>A Match cannot exists without an away team.  If you remove it, then if there is a Home team it will be swapped over, 
              otherwise the match will be deleted.</li>
              <li>Clicking on the "@" sign in the middle will swap the teams (subject to the rule about always having an Away team).</li>
              <li>The bottom panel of the match acts as normal to set match time, mark the match open or change the comment (click on the 
              <material-icon class="in">comment</material-icon>).</li>
              <li>The remaining panels all bring up a dialog box with the ability to change the value. Click outside the dialog to close it.</li>
              <li>The score to the break between over and under shows a ".5" value.  When the dialog opens only enter the number before
              the decimal point.</li>
            </ul></li>
          <li>You can send e-mails to users.  More info when implemented.</li>
        </ul>
      </fm-page>
    `;
  }
}
customElements.define('admin-help', AdminHelp);