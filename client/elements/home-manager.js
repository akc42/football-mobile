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
import {switchPath} from '../modules/utils.js';
import api from '../modules/api.js';



/*
     <fw-home>.  The sole purpose of this element is to determin which of 6 possible paths to switch to
     firstly if the cid is not the same as dcid then either cid = lcid and user uid = luid or global admin in which case we are admin
     of the cid and we should go the /admin , otherwise to /scores.  If neither of these two conditions are satisfied then if we are not registered for the competition and the competition is still taking registrations we go to /register.  If we are not registered and the 
     competition is not taking registrations then we go to /scores.

     If we are registered for the competiion we have to check with there are any matches not passed their pick deadline, in which case we go to /picks, otherwise if there any picks from me already made then I go to /results, otherwise I go to /teams.
*/
class HomeManager extends LitElement {

  connectedCallback() {
    super.connectedCallback();
    this._reroute();
  }

  render() {
    return html`
    `;
  }
  async _reroute() {
    if (global.cid === 0) global.cid = global.lcid;
    if (global.cid !== global.lcid) {
      switchPath(`/${global.cid}/scores`);
    } else {
      const response = await api(`/user/${global.lcid}/can_register`);
      if (response.isOpen) {
        if (response.isRegistered) {
          const response = await api(`/user/${global.lcid}/can_pick`);
          if (response.rid === 0) {
            if(response.poffs > 0) {
              switchPath(`/${global.cid}/teams/user`)
            } else {
              if (global.user.uid === global.luid) {
                switchPath(`/${global.cid}/admin`);
              } else {
                switchPath(`/${global.cid}/teams`);
              }
            }
          } else {
            if (response.bonus) {
              switchPath(`/${global.cid}/rounds/${response.rid}/bonus`);
            } else if (response.matches > 0) {
              switchPath(`/${global.cid}/rounds/${response.rid}/match`);
            } else {
              switchPath(`/${global.cid}/rounds/${response.rid}`);
            }
          }
        } else if (response.canRegister) {
          switchPath(`/${global.cid}/register`);
        } else {
          switchPath(`/${global.cid}/scores`);
        }
      } else {
        if (global.user.uid === global.luid) {
          switchPath(`/${global.cid}/admin`);
        } else {
          switchPath(`/${global.cid}/soon`);
        }
      }
    }
  }
}
customElements.define('home-manager', HomeManager);