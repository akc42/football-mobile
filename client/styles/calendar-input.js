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
    --icon-size:20px;
    --line-color: #404040;
  }
  .input {
    display: flex;
    flex-direction: row;
    justify-content:space-evenly;
    align-items: center;
    border: 2px solid var(--app-accent-color);
    background-color: white;
    cursor: pointer;
  }
  .container {
    padding: 5px;
    box-shadow: 2px 2px 6px 0px rgba(0,0,0,0.5);
    border-radius: 4px;
    border:2px solid white;
    background-color: var(--app-accent-color);
    color: var(--app-accent-text);
    width: 160px;
  }
  .datepanel {
    display: grid;
    grid-gap: 1px;
    grid-template-columns: repeat(7, 1fr);
    --icon-size: 16px;
    text-align: right;
    margin: 2px 0;
    background-color: var(--line-color);
  }
  .datepanel>.month {
    grid-column: 2 / 7;
    grid-row: 1 / 2;
    text-align: center;
    cursor: default !important;
  }
  .timepanel {
    display: grid;
    grid-gap: 1px;
    grid-template-areas:
      ". am am am pm pm pm"
      "hr hp hp hp hp hp hp"
      "hr  hp hp hp hp hp hp"
      "mi mn mn mn mn mn mn"
      "mi mn mn mn mn mn mn";
    border-top: 2px solid white;
    margin: 2px 0;
    background-color: var(--line-color);
  }
  .datepanel>*, .timepanel>* {
    background-color: var(--app-accent-color);
    box-sizing:border-box;
    height:20px;
  }
  .datepanel>* {
    cursor: pointer;
  }
  .datepanel>.wd {
    cursor: default !important;
  }
  .datepanel>.day {
    color: grey;
  }
  .day.inmonth {
    color: white;
  }
  .am, .pm, .hr, .mi , .month .day.today {
    color: #cf0;
  }
  .day.selected, .day.inmonth.selected , .am.selected, .pm.selected, .hour.selected, .minute.selected {
    color: red;
    border:1px solid red;
  }


  .am {
    grid-area: am;
    text-align: right;
    padding-right: 30px;
    cursor:pointer;
  }
  .pm {
    grid-area: pm;
    text-align: left;
    padding-left:30px;
    cursor: pointer;
  }
  .hr {
    grid-area: hr;
    height: 41px;
  }
  .mi {
    grid-area: mi;
    height:41px;
  } 
  .hours {
    grid-area: hp;
  }
  .minutes {
    grid-area: mn;
  }
  .hours, .minutes{
    display: grid;
    grid-gap: 1px;
    grid-template-columns: repeat(6, 1fr);
    text-align: right;
    background-color: var(--line-color);
    height: 41px;
  }
  .hours>*, .minutes>* {
    background-color: var(--app-accent-color);
    cursor: pointer;
    box-sizing:border-box;
    height: 20px;
  }
  .unset {
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 4px;
    border-top: 2px solid white;
  }
  .unset button {

    width: 70px;
  }  
`;