
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
  button {
    background-color: var(--app-accent-color);
    min-width:80px;
    color: var(--app-reverse-text-color);
    border: none;
    padding: 5px;
    border-radius:5px;
    box-shadow: 2px 2px 5px 4px rgba(0,0,0,0.2);
  }
  button:active {
    box-shadow: none;
`;
