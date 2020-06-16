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
      display: flex;
      flex-direction: row;

    }
    :host([hidden]) {
      display: none;
    }

    #checkmark {
      width: 16px;
      height:16px;
      --icon-size:  12px;
      -webkit-box-shadow: 1px 1px 3px 0px rgba(0,0,0,0.5);
      -moz-box-shadow: 1px 1px 3px 0px rgba(0,0,0,0.5);
      box-shadow: 2px 2px 6px 0px rgba(0,0,0,0.5);
      border-radius: 4px;
      cursor: pointer;
      display:flex;
      justify-content:center;
      align-items:center;
      background-color: var(--app-cancel-button-color);
    }
    #checkmark:focus {
      outline:none;
    }
    #checkmark[checked] {
      background-color: var(--app-accent-color,#131335);
      color: var(--app-reverse-text-color,white);
    }
    #checkmark[disabled], #checkmark[checked][disabled] {
      background: var(--app-disabled-color, lightgrey);
      color: var(--app-disabled-text, lightgrey)
    }
    #checklabel {
      margin-left: 10px;
    }
`;
