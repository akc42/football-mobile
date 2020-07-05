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
    display: inline-block;
    font-size: 12px;
    font-weight: bold;
  }
  .date {
    display: flex;
    flex-direction: row;
    width: 94px;
    justify-content: center;
    padding: 2px;
  }
  .date.time {
    width: 168px;
  }
        
`;