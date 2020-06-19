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
#defs {display: none;}
  button, #text {
    position: relative;
  }
  @keyframes feather-fade {
    0% {
      top: -20px;
      opacity: 0;
    }
    25% {
      transform: rotate(10deg);
      left: 30%;
    } 
    50%{
      transform: rotate(-5deg);
      opacity: 1;
      left: 45%;
    }
    75%{
      transform: rotate(10deg);
      left: 32%;
    }
    100% {
      transform: rotate(0deg);
      opacity: 1;
      left: calc(50% - 20px);
      top: calc(100% + 10px);
    } 
  }
  .feather {
      position: absolute;
      width: 41px;
      height: 23px;
      left: calc(50% - 20px);
      top: calc(100% + 10px);
      opacity: 0; 
      filter: var(--primary-color-filter);
      animation: feather-fade 1.5s linear 0.5s forwards;
  }
  button:focus, .feather:focus, bird:focus {
    outline: none;

  }
  .bird {
      display:block;
      position: absolute;
      background: transparent;
      width: 30px;
      height: 35px;
      overflow: hidden;
      opacity:0;
  }	
  .alpha {
    transition : left 1.5s cubic-bezier(0.42, 0, 0.58, 1), top 1.5s cubic-bezier(0.42, 0, 0.58, 1), opacity 0.5s linear 1s;
  }
  .beta {
    transition : left 1.5s cubic-bezier(0.42, 0, 0.58, 1) .3s, top 1.8s cubic-bezier(0.42, 0, 0.58, 1), opacity 0.5s linear 1.3s;
  }
  .gamma {
    transition : left 1.7s cubic-bezier(0.42, 0, 0.58, 1) .6s, top 2s cubic-bezier(0.42, 0, 0.58, 1) .3s, opacity 0.5s linear 1.8s;
  }
  .delta {
    transition : left 2s cubic-bezier(0.42, 0, 0.58, 1) 1s, top 1s cubic-bezier(0.42, 0, 0.58, 1) 2s, opacity 0.5s linear 2.5s;
  }
  button:hover	.birdonhover, .flying{
    left: 15px !important;
    top: -7px !important;
    opacity: 1;
    transition: all 0.01s;
  }
  .birdicon {
      width: 90px;
      height: 35px;
      transform: translateX(-100%);
      filter: var(--primary-color-filter);
      animation-name: fly-cycle;
      animation-duration: 0.5s;
      animation-timing-function: steps(3);
      animation-iteration-count: infinite;
  }
  @keyframes fly-cycle {
    100% {
      transform: translateX(0); 
    } 
  }
`;