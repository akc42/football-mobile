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

    background-color: var(--app-primary-color);
    display: grid;
    grid-gap:2px;
    grid-template-columns: 2fr repeat(4,1fr);
    grid-template-areas:
      "un mr ou bn tl"
      "un pk pk op done";
  }
  .un, .mr, .ou, .bn, .tl, .pk, .op, .done {
    padding:2px;
    background-color: white;
    color:var(--app-primary-text);
    text-align: center;
    vertical-align: center;
    cursor:pointer;
  }
  .un {
    grid-area:un;
  }

  .mr {
    grid-area:mr;
  }
  .ou {
    grid-area: ou;
  }
  .tl {
    grid-area:tl;
  }
  .pk {
    grid-area: pk;
  }
  .op {
    grid-area: op;
  }
  .done {
    grid-area: done;
    color: green;
  }
  .me {
    background-color: var(--app-user-color);
    color: var(--app-user-text);
    font-weight: bold; 
  }
  .late {
    font-size: 8pt;
    font-weight: normal;
  }
  .support {
    color: red;
    font-weight: normal;
  }
`;