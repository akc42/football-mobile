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
import { css } from '../libs/lit-element.js';

export default css`
  :host {
    height: 100%;
  }
  .competition {
    background-color: white;
    border:2px solid var(--app-accent-color);
    border-radius: 5px;
    box-shadow: 1px 1px 3px 0px rgba(0,0,0,0.31);
    margin:5px 5px 5px 3px;
    display: flex;
    flex-direction: row;
    justify-content: space-around;  
    align-items: center;     
  }
  ::slotted(*) {
    flex: 1 0 0;
    margin: 0 5px;
  } 
  .competition>div#compname {
    flex: 0 1 auto;
    margin: 0;
    text-align:center;
  } 
`;