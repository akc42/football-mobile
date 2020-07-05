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

import './app-page.js';
import page from '../styles/page.js';
import { MenuAdd } from '../modules/events.js';
import global from '../modules/globals.js';

/*
     <fm-help>
*/
class FmNavref extends LitElement {
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
        ul{
          list-style: none;
          padding-inline-start: 15px;
        }
        ul li {
          text-indent: -15px;
        }
        ul li:before {
          content: "-";
          
        }
        ul li.home:before {
          content:"";
        }
      </style>
      <app-page id="page" heading="Navigation Reference">
        <h1>Introduction</h1>
        
        <p>Football Mobile has a number of challenges to overcome, in that it is designed to work on relatively
        small screens, yet has a lot of information to display.  As a result that way that one navigates between
        each page, where each page can only hold a limited about of information is crucial.</p>

        <p>Before you are logged in the url is ignored, and a session manager manages the process.  However <em>once</em>
        you have logged in navigation is controlled by the url and will change as you move from page to page.   
        Football Mobile will ensure that browser history correctly reflects all the 
        changes in page as you move from one to another except in the specific case where the browser automatically changes the url
        rapidly for you, as a page has to remain on display for at least two seconds before it is remembered. The url will
        also generally carry specific parameters (such as a specific round to display when its not the default).  There
        are two pieces of information that are carried between pages - this are details about you (specifically your user id) and the
        id of the competition - that is not carried in the url, but rather in some global variables available to all pages.</p>

        <p>The following sections explain the details of the url and how to change the url to achieve your desired view.</p>

        <h1>The url hierarchy</h1>

        <p>The url is also organised into a hierarchy.  So for instance <strong>/round</strong> shows your picks and bonus
        answers for the latest round, and <strong>/round/5</strong> will 
        show the picks and bonus answers for round 5 and <strong>/round/5/match/atl</strong> will show all users scores for the match
        in round 5 where Atlanta Falcons were the away team.</p>

        <p>The single <strong>/</strong> is known as the home page.  In this application we never stay at the home page as it is
        immediately switched to a different url by the software dependant on the competition and user selected.</p>
        
        <p>The selection algorithm
        aims to show the <strong>/summary</strong> page whenever we not looking at the latest competition.  If we are looking at
        latest competition and that competition is not yet open, it depends if you are the administrator of it or not.  If you are,
        you are taken to the <strong>/admin</strong> page, otherwise you will go to the <strong>/soon</strong> page.  
        
        unless you are the adminstrator
        for that particular competition, when it will show you the <strong>/admin</strong> page.  However at the
        latest competition, if registrations are open
        and you are not registered you will be shown the <strong>/registration</strong> page.</p>
        
        <p>If you are registered, then if
        the <em>picks</em> window is open (either it is not later than all the match deadlines in the latest round, or the
        playoff deadline as not yet been reached) you will be shown the <strong>/rounds</strong> page if the current round 
        has matches not past their deadlines, or the <strong>/teams</strong> page otherwise.</p>  
        
        <p>If the picks window is not open but there has been at least one open round specified for the competition you will
        be shown the </strong>/rounds</strong> page, where (r) is the number of that latest round. Finally, if there is
        nothing else to display <strong>/summary</strong> page where everyone will have zero score, but at least you can
        see who is registered.</p>

        <p>The full url heirachy is shown below:-
          <ul>
            <li class="home"><strong>/</strong> - home - but as explained above, a temporary location which leads somewhere else.
              <ul>
                <li><strong>/soon</strong> - a page to ask people to come back soon</li>
                <li><strong>/register</strong> - a page to register for the competition.</li>
                <li><strong>/teams</strong> - a page to make playoff picks for the current user.
                  <ul>
                    <li><strong>/user/(u)</strong> - page to show playoff picks for the specific user (with id (u))
                    <li><strong>/division/(c)/(d)</strong> - a page to show all users picks and scores for a specific combination of
                      conference and division</li>
                  </ul>
                </li>
                <li><strong>/rounds</strong> - a page for you to make your picks for the current round and/or display the results.
                  A menu item will be available for the user to select a specific round
                  <ul>  
                    <li><strong>/(r)</strong> - (r) represents the round number and without any further segments in the url will
                    display a list of users and their match and option scores from the round. 
                      <ul>
                        <li><strong>/user/(u)</strong> - display the results for a specific user</li>
                        <li><strong>/match/(m)</strong> - a page to show all users picks  and scores for a particular match. Due to a mistake in
                        a much earlier version of this appliation, (m) is the three letter code of the away team.</li>
                      </ul>
                  </ul></li>
                <li><strong>/summary</strong> - a page to show the totals of all users
                  <ul>
                    <li><strong>/user/(u)</strong></li>
                  </ul>
                ${cache(global.user.member_approve === 1? html`<li><strong>/approve</strong> - a page to show users awaiting approval
                  with an option to <strong>Accept</strong>, <strong>Request</strong> (send an e-mail requesting more information), 
                  <strong>Reject</strong> (explicitly send an email explaing why) or, <strong>Delete</strong> (for spammers
                  etc; silently delete the request)</li>`:'')}
                <li><strong>/admin</strong> - ${cache(global.user.uid === global.luid || global.user.global_admin === 1)? html`
                  a page that shows an overview of the competition details that the adminstrator can edit, including a button for 
                  creating a new round.  
                  <ul>
                    <li><strong>/round</strong> - a page that allows the editing of details for the latest round of the competition.
                      <ul>
                        <li><strong>/(r)</strong> - accessing a specific round in the competition (selectable from the main menu)
                      </ul>
                    </li>
                    </li><strong>/email</strong> - details of users in the competition, with the ability to send selected users a
                    short e-mail.</li>
                    <li><strong>/help</strong> - a menu of topics the administrator can select (see following urls) to get more information.
                      <ul>
                        <li><strong>/competition</strong> How to set up a new competition including the parameters involved</li>
                        <li><strong>/teams</strong> Understanding and manipulating the team panel.</li>
                        <li><strong>/matches</strong> Understanding and manipulating the match panel.</li>
                        <li><strong>/bonus</strong> Understanding and manipulating the bonus panel.</li>
                  </ul>  
                `:html`
                a page for adminstrators to manage the competition.`}</li>
                ${cache(global.user.global_admin === 1 ? html`
                  <li><strong>/gadm</strong> - A menu of choices as follows:
                    <ul>
                      <li><strong>/new</strong> - create a new competition and assign an adminstrator</li>
                      <li><strong>/promote</strong> - show a list of users and promote (or down grade) member approver status, or premote to a global admin (there is currently no option to demote a user once they have been promoted to global admin status, status, so promotion to that status should be a rare occurrance.  It is not necessary for someone to be global admin to run a competition).</li>
                      <li><strong>/email</strong> - send some, or all users a simple e-mail.</li>
                    </ul>
                  </li>
                `:'')}
                <li><strong>/profile</strong> - a page where you can edit your details.</li>
                <li><strong>/navref</strong> - this page.
                </li><strong>/help</strong> - a page detailing how you play the competition.</li>
              </ul>
            </li>
          </ul>
        </p>


        <h1>How to Change the url</h1>
        


        <p>There are just four ways in which user can navigate between pages.  These are:-
        <ol>
          <li>Use buttons on the page to click.  This will generally initiate (or abandon) an action and then navigate you to a follup up page.</li>
          <li>Use the back and forward buttons on the browser.  This is a simple mechansim that will take to back to a previous page, or (if you have already gone back) forward to a page you jumped back from.</li>
          <li>Use the <material-icon>reply</material-icon> if it is in the main application toolbar.  This will take you one level up the hierarary.  So for example of you were at url <strong>/round/5/match/atl</strong>, clicking the <material-icon>reply</material-icon> button will take you to url <strong>/round/5/</strong>  (match and atl were added in a single step - see above).</li>
          <li>Use the <material-icon>menu</material-icon> button.  This will pop up a menu of options that you can take.</li>
          <li>If the current page has some form of list (of users, matches, team, rounds - etc) then clicking on one particular item of that list will take you to a page with more detailed information with that particular item the focus.</li>
        </ol>
        </p>
        <p>This should enable you to access all aspects of the application quite simply.</p>
      </app-page>
    `;
  }
}
customElements.define('fm-navref', FmNavref);