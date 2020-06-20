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
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-areas:
      "user rs ps"
      "user ts ts";
  }
  .un,.rs,.ps,.ts {
    padding:2px;
    background-color: white;
    color:var(--app-primary-text);
    text-align: center;
    vertical-align: center;
  }
  .un {
    grid-area:user
  }

  .rs {
    grid-area:rs;
  }
  .ps {
    grid-area: ps;
  }
  .ts {
    grid-area:ts;
  }
  .me {
    background-color: var(--app-user-color);
    color: var(--app-user-text);
    font-weight: bold;
  }

`;