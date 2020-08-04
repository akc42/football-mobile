
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
    display:flex;
    flex-direction:column;
    align-items: stretch;
    box-sizing: border-box;
  }
  
  [hidden] {
    display: none !important;
    flex:0, 1, 0px;
  }

  .scrollable {
    overflow-y:auto;
    scroll-snap-type: y mandatory;
    
  }
  header {
    flex:0 1 0;
  }
  section {
    flex: 1 0 0;
  }

`;
