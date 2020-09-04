
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
    position: relative;
  }
  input {
    opacity: 0;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    z-index: -1;
  }

  label span {
    border-radius: 50%;
    border: 2px solid var(--color);
    display: inline-block;
    margin-right: 0.5em;
    vertical-align: bottom;
    width: 12px;
    height: 12px;
    position: relative;
  }
  input:checked + label span {
    border-color: var(--accent-color);
  }
  input:checked + label span::before {
    content: "";
    display: block;
    width: inherit;
    height: inherit;
    border-radius: inherit;
    position: absolute;
    transform: scale(0.6);
    transform-origin: center center;
    background-color: var(--accent-color);
  }
`;
