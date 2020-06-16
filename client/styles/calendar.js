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
  div.calendar {
    height:20px;
    padding:2px 3px;
    border:2px inset black;
  }
  span.calendar {
    font: normal 14px/16px Arial, Helvetica, sans-serif;
  }

  button.calendar {
    background: url(calendar-icon.gif);
    border: 0;
    cursor: pointer;
    float: right;
    height: 20px;
    width: 20px;
  }
  button.calendar:hover,
  button.calendar.active {
    background-position: 0 20px;
  }

  div.picker {
    background: url(calendar.png) no-repeat;
    height: 299px;
    padding: 0 12px;
    text-align: center;
    width: 147px;
    font: normal 16px/20px verdana, Helvetica, sans-serif;

  }	
  div.picker * {
    margin: 0;
    padding: 0;
  }	
  div.picker div {
    background: none !important;
    cursor: move;
    height: 289px;
    overflow: hidden;
    padding-top: 10px;
    position: relative;
    width: 147px;
  }	
  
  div.picker caption {
    color: #CF0;
    font: normal 12px/17px Arial, Helvetica, sans-serif;
    padding-top: 4px;
    text-align: center;
    width: 100%;
  }

  div.picker caption a {
    display:none;
  }
  
  div.picker caption a.prev, div.picker caption a.next {
    cursor: pointer;
    display: block;
    height: 11px;
    overflow: hidden;
    position: absolute;
    top: 16px;
    width: 11px;
    text-indent: -100px;
  }
  div.picker caption a.prev {
    background-image: url(calendar-prev.gif);
    left: 1px;
  }
  div.picker caption a.next {
    background-image: url(calendar-next.gif);
    right: 1px;
  }
  div.picker caption a:hover {
    background-position: 0 11px;
  }
  div.picker caption span {
    height: 25px;
    position: relative;
    text-align: center;
  }
  div.picker caption span.month {
    padding-right: 8px;
  }
  div.picker caption span.month:after {
    content: ',';
  }

  div.picker table {
    border: 0;
    border-collapse: collapse;
    border-spacing: 0;
    cursor: default;
    margin: 0 auto;
    overflow: hidden;
    width: 147px;
  }
  div.picker td,
  div.picker th {
    border: 0;
    color: #999;
    font: normal 12px Arial, Helvetica, sans-serif;
    height: 19px;
    text-align: center;
    width: 21px;
  }
  div.picker td {
    color: #333;
    font-size: 11px;
    padding-right: 5px;
    text-align: right;
    width: 16px;
  }
  div.picker td.invalid {
    color: #666;
  }
  div.picker td.valid {
    color: #FFF;
    cursor: pointer;
  }
  div.picker td.today {
    color:#CF0;
    cursor:pointer;
  }
  div.picker td.active,
  div.picker td:hover {
    color: red;
    cursor: pointer;
  }


  div.picker td.hour, div.picker td.minute {
    color:#CF0;
  }

  div.picker div.unset {
    border:1px solid #666;
    color: #CF0;
    cursor:pointer;
    text-align:center;
    height:16px;
    width:50px;
    font: normal 12px/17px Arial, Helvetica, sans-serif;
    padding:2px;
    margin:5px 0 0 40px;
  }

  div.picker div.unset:hover {
    border-color:#CF0;
  }
`;