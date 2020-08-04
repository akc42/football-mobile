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
  [data-tooltip] {
    display: inline-block;/*bug fix*/
    position: relative;
    text-decoration: none;
  }
  [data-tooltip]:after {
    content: attr(data-tooltip);
    position: absolute;
    top: -200vh; /* way off screen to the top */
    left: -200vw; /* way off screen to the left */
    margin: 0;
    padding: 7px;
    max-width: 600px;
    width: fit-content;
    min-width: 44px;
    white-space: pre;
    color: var(--secondary-contrast-color);
    background: var(--secondary-color);
    font-size: 12px;
    font-weight: normal;
    font-family: helvetica;
    text-align: center;
    line-height: 1.2;
    border-radius: 3px;
    opacity: 0;
    z-index: 3;
  }
  [data-tooltip]:before {
    content: " ";
      opacity: 0;
      pointer-events: none;
      display: none;
      position: absolute;
      top: -200vh; /* way off screen to the top */
      left: -200vw; /* way off screen to the left */
      margin: 0;
      width: 0;
      box-shadow: 0px 0px 50px 3px var(--shadow-color);
      border-bottom: 5px solid var(--secondary-color);
      border-right: 5px solid transparent;
      border-left: 5px solid transparent;
      border-top: 0px;
      content: " ";
      font-size: 0;
      line-height: 0;
      z-index: 4;
  }
  [data-tooltip]:hover:after, [data-tooltip]:hover:before {
      top: 100%;
      left: 50%;
      opacity: 1;
      display: block;
      animation: bring-in 0.3s 
  }
  [data-tooltip]:hover:after {
    margin: 10px 0px 0px -20px;
  }
  [data-tooltip]:hover:before {
    margin: 5px 0px 0px -5px;
  }
  @keyframes bring-in {
    0% {
      top: -200vh; /* way off screen to the top */
      opacity: 0;
    }
    5% {
      top: 100%;
      left: 50%;
    }
    100% {
      opacity: 1;
    }
  }

  /* variants */
      /* now a version above */
  [data-tooltip].above:hover:after {
    top: auto;
    bottom: 20%;
    margin: 0px 0px 0px -80px;
  }
  [data-tooltip].above:hover:before {
    display: none!important;
  }
    /* version left */
  [data-tooltip].left:hover:after, .left [data-tooltip]:hover:before {
      top: 100%;
      right: 100%;
      left: auto;
      opacity: 1;
      display: block;
      animation: bring-in-left 0.3s 
  }
  @keyframes bring-in-left {
    0% {
      top: -200vh; /* way off screen to the top */
      right: -200vh;
      opacity: 0;
    }
    5% {
      top: 100%;
      left: auto;
      right: 100%;
    }
    100% {
      opacity: 1;
    }
  }

  [data-tooltip].left:hover:after {
    top: 50%;
    right: 100%;
    left: auto;
    margin: -15px 10px 0px 0px;
  }
  [data-tooltip].left:hover:before {
    top: 50%;
    right: 100%;
    left: auto;
    margin: -2px 5px 0px 0px;
    border-left: 5px solid var(--secondary-color);
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-right: 0px;
  }

    /* version right */
  [data-tooltip].right:hover:after {
    top: 50%;
    left: 100%;
    margin: -15px 0px 0px 10px;
  }
  [data-tooltip].right:hover:before {
    top: 50%;
    left: 100%;
    margin: -2px 0px 0px 5px;
    border-right: 5px solid var(--secondary-color);
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 0px;
  }
  [data-tooltip].bottom-left:hover:after {
    top: 100%;
    right: 100%;
    left: auto;
    margin: 10px -30px 0px 0px
  }
  [data-tooltip].bottom-left:hover:before {
    top: 100%;
    right: 100%;
    left: auto;
    margin: 5px -15px 0px 0px
  }
  [data-tooltip].bottom-right:hover:after {
    top: 100%;
    left: 100%;
    margin: 10px 0px 0px -30px
  }
  [data-tooltip].bottom-right:hover:before {
    top: 100%;
    left: 100%;
    margin: 5px 0px 0px -15px
  }
`;


