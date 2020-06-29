/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file is part of Program.

    Program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Program.  If not, see <http://www.gnu.org/licenses/>.
*/
import { css } from '../libs/lit-element.js';

export default css`
       :host{
        font-family:"Material Icons";
        font-weight:normal;
        font-style:normal;
        font-size:var(--icon-size, 24px);
        line-height:1;
        letter-spacing:
        normal;
        text-transform:none;
        display:inline-block;
        white-space:nowrap;
        word-wrap:normal;
        direction:ltr;
        font-feature-settings:'liga';
        -webkit-font-smoothing:antialiased;
      }
 
`;