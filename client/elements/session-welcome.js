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

import global from '../modules/globals.js';
import page from '../styles/page.js';

import './fm-page.js';
/* 

  IMPORTANT NOTICE.  THIS IS ONE OF THE FEW FILES IN THE REPOSITORY THAT IS SPECIFICALLY FOR MELINDA'S BACKUPS

  That is because it "should" only appear if a user already has an entry in the participant record of the database
  and that can only happen if this instanciation of the project is the Melinda's Backups one.  Longer term, if anyone
  else has deployed this system and you have deleted the password entries in the database you will get this page.  In which case
  you will have to change it to your specific case.

  To be clear.  This page will display if a participant exists (ie their - email address matches), they can pass the captcha checks
  on the email verify screen,they are not a "waiting approval" member and there is no password in the password field of the database.  

  When a new member is approved, we will generate and provide them with a simple password, but it will be expected to be changed by them
  on first visit.  If they fail to do that, they will not be able to get through the initial checks and will have to then say they have forgotten
  their password on the next visit.

*/




/*
     <Session Welcome>: Special Screen for Users of the Old Version of MBBall
*/
class SessionWelcome extends LitElement {
  static get styles() {
    return page;
  }
  static get properties() {
    return {
      user: { type: Object }
    };
  }
  constructor() {
    super();
    this.user = {uid: 0, email:''};

  }


  render() {
    return html`
      <style>

      </style>

      <fm-page heading="Welcome Back">      
        <p>Welcome Back to Melinda's Backups.  You will notice that this is a completely new version of the software which has been
          designed to work on mobile phones as well as desktop computers. You will also have noticed that you now have to pass through a sign in
          screen.  The original football worked with the forum so if you were signed in to the forum you were signed in to football.  This is no longer the case.
        </p>
        <p>One immediate issue is that alhough we have your e-mail address, we don't have a password for you.  To overcome that, we have sent you a special 
          e-mail (to ${this.email}) from Hephy (remember him!) with a link. This link will log you into the system and take you to a profile page where you can
          set up passwords (and some other things).  To provide you with protection against misuse it has to be used within ${global.verifyExpires} hours from now and it cannot be used more than once.</p>

        <p>As this is now a mobile oriented application, if at all possible, use the link from your mobile device.  If that is not possible just set up your password in the profile page and then use your mobile device to log in using it.</p>

        <p>If you do not receive the link, or are unable to use it within the alotted time, just try to log in again and you will be sent another link.  Please wait at least 30 minutes between attemtps as there is also protection against misuse here too.</p>
      </fm-page>
    `;
  }

}
customElements.define('session-welcome', SessionWelcome);