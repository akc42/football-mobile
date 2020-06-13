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


import {css} from '../libs/lit-element.js';

export default  css`
  :host{
    height:100%;
    display: flex;
    flex-direction:column;
    max-width: 600px;
    justify-content: start;
    padding:10px;
  }
  header {
    height: 64px;
    margin: 0 auto;
    padding: 0;
  }
  .action {
    display: flex;
    width:100%;
    flex-direction:row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    margin-top:auto;
  }

  @media (min-width: 500px) {

    .action {
      margin-top: 10px;
    }
    :host {
      margin: 40px auto 40px auto;
      height: auto;
      border-radius: 10px;
      box-shadow: 0px 0px 38px -2px rgba(0, 0, 0, 0.5);
      padding: 20px;
    }
  }

  }

`;
