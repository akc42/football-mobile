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
    box-sizing:border-box;
  }
  header {
    display: flex;
    flex-direction: row;
    flex:0 1 0;
  }
  header .heading {
    margin-left: 10px;
    font-weight: bold;
    font-size:18px;
    text-transform: uppercase;
    flex:1 1 auto;
    text-align: center;
    vertical-align:middle;
    background-color: var(--app-primary-color);
    color: var(--app-primary-text);
    border-radius: 5px;
  }
  section {
    flex: 1 0 0;
    height:100%;
    display: flex;
    flex-direction: column;
  }

  .action {
    display: flex;
    width:100%;
    flex-direction:row;
    flex-wrap: wrap;
    justify-content: space-evenly;
    flex:0 1 auto;
  }

  @media (min-width: 500px) {

    :host {
      margin: 40px auto 40px auto;
      max-height: 100%;
      border-radius: 10px;
      box-shadow: 0px 0px 38px -2px rgba(0, 0, 0, 0.5);
      padding: 20px;
      min-width: 500px;
    }
  }

  }

`;
