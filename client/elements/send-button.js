/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file is part of Football Mobilve.

    Football Mobilve is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Football Mobilve is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
		along with Football Mobilve.  If not, see <http://www.gnu.org/licenses/>.

Although the use of the lit element helper and construction of the custom element are mine, the concept 
and details of the css in this element were derived from work licenced as below:-
		
Copyright (c) 2020 by Claudia (https://codepen.io/eyesight/pen/KGEebY)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
import { LitElement, html } from '../libs/lit-element.js';
import { cache } from '../libs/cache.js';
import {classMap} from '../libs/class-map.js';

import button from '../styles/button.js';
/*
     <send-button>
*/
class SendButton extends LitElement {
  static get styles() {
    return [button];
  }
  static get properties() {
    return {
			showFeather: {type: Boolean},
			showBirds: {type: Boolean}
    };
  }
  constructor() {
		super();
		this.showFeather = false;
		this.showBirds = false;
	}
	firstUpdated() {
		this.feather = this.shadowRoot.querySelector('#feather');
	}
  render() {
    return html`
      <style>
/*


.wrapper-no4		.button-bird:hover	.bird--30{
				left: 600px;
				top: -550px;
				opacity: 0;
				transition: left 1.5s cubic-bezier(0.42, 0, 0.58, 1), top 1.5s cubic-bezier(0.42, 0, 0.58, 1), opacity 0.5s linear 1s;
			}
.wrapper-no4		.button-bird:hover	.bird--30:after{
				left: 50px;
				top: 50px;
				transition: all 1.5s cubic-bezier(0.42, 0, 0.58, 1) -0.5s;
			}
.wrapper-no4		.button-bird:hover	.bird--30:before{
				left: -50px;
				top: 50px;
				transition: all 1.5s cubic-bezier(0.42, 0, 0.58, 1) -0.5s;
			}

.wrapper-no4		.feather{
			position: absolute;
			width: 18%;
			left: 40%;
			top: 12px;
			display: none;
			opacity: 0;
			fill: var(--color4)
		}
	
	
	.button-bird.active {
		background-color: transparent;
		transition: all 0.2s linear 0.1s;

		.button-bird__text{
			color: $color4;
			animation: text-fade 1.5s 0.2s;
		}
		.feather{
			display: block;
			animation: feather-fade 1.5s linear 0.5s forwards;
		}
		.bird--20,
		.bird--19,
		.bird--18,
		.bird--21,
		.bird--23,
		.bird--25,
		.bird--30{
			left: 600px;
			top: -550px;
			opacity: 0;
			transition: left 2s cubic-bezier(0.42, 0, 0.58, 1), top 2s cubic-bezier(0.42, 0, 0.58, 1), opacity 0.5s linear 1.5s;
		}
		.bird--5,
		.bird--17,
		.bird--16,
		.bird--15,
		.bird--22{
			left: 600px;
			top: -600px;
			opacity: 0;
			transition: left 2s cubic-bezier(0.42, 0, 0.58, 1) 0.1s, top 2s cubic-bezier(0.42, 0, 0.58, 1) 0.1s, opacity 0.5s linear 1.6s;
		}
		.bird--14,
		.bird--13,
		.bird--12,
		.bird--24,
		.bird--1{
			left: 650px;
			top: -650px;
			opacity: 0;
			transition: left 2s cubic-bezier(0.42, 0, 0.58, 1) 0.15s, top 2s cubic-bezier(0.42, 0, 0.58, 1) 0.15s, opacity 0.5s linear 1.65s;
		}
		.bird--11,
		.bird--10,
		.bird--9,
		.bird--26,
		.bird--27{
			left: 650px;
			top: -700px;
			opacity: 0;
			transition: left 2s cubic-bezier(0.42, 0, 0.58, 1) 0.2s, top 2s cubic-bezier(0.42, 0, 0.58, 1) 0.2s, opacity 0.5s linear 1.7s;
		}
		.bird--8,
		.bird--7,
		.bird--6,
		.bird--28{
			left: 700px;
			top: -750px;
			opacity: 0;
			transition: left 2s cubic-bezier(0.42, 0, 0.58, 1) 0.25s, top 2s cubic-bezier(0.42, 0, 0.58, 1) 0.25s, opacity 0.5s linear 1.75s;
		}
		.bird,
		.bird--4,
		.bird--29,
		.bird--3{
			left: 750px;
			top: -800px;
			opacity: 0;
			transition: left 2s cubic-bezier(0.42, 0, 0.58, 1) 0.3s, top 2s cubic-bezier(0.42, 0, 0.58, 1) 0.3s, opacity 0.5s linear 1.8s;
		}
		.bird--2{
			left: 850px;
			top: -850px;
			opacity: 0;
			transition: left 1.5s cubic-bezier(0.42, 0, 0.58, 1) 0.35s, top 1.5s cubic-bezier(0.42, 0, 0.58, 1) 0.35s, opacity 0.5s linear 1.8s;
		}
		.bird--5:after,
		.bird--4:after,
		.bird--8:after,
		.bird--14:before,
		.bird--16:after,
		.bird--17:before,
		.bird--21:after,
		.bird--30:after,
		.bird--30:before{
			left: 50px;
			top: -100px;
			transition: all 1s cubic-bezier(0.42, 0, 0.58, 1) -0.3s;
		}
		.bird--4:before,
		.bird--7:before,
		.bird--9:after,
		.bird--12:before,
		.bird--13:before,
		.bird--18:after,
		.bird--27:after,
		.bird--26:before{
			left: -50px;
			top: 0px;
			transition: all ss cubic-bezier(0.42, 0, 0.58, 1) -0.5s;
		}
		.bird:before,
		.bird--2:after,
		.bird--1:after,
		.bird--7:after,
		.bird--8:before,
		.bird--15:after,
		.bird--19:before,
		.bird--22:after,
		.bird--28:after,
		.bird--28:before,
		.bird--3:after{
			left: 100px;
			top: -100px;
			transition: all 1s cubic-bezier(0.42, 0, 0.58, 1) 0s;
		}
		.bird--2:before,
		.bird--1:before,
		.bird--9:before,
		.bird--12:after,
		.bird--13:after,
		.bird--17:after,
		.bird--19:before,
		.bird--23:after,
		.bird--23:before{
			left: 50px;
			top: -10px;
			transition: all 2s cubic-bezier(0.42, 0, 0.58, 1) -0.5s;
		}
		.bird:after,
		.bird--6:before,
		.bird--10:after,
		.bird--11:after,
		.bird--16:before,
		.bird--18:before,
		.bird--20:before,
		.bird--24:before,
		.bird--26:after,
		.bird--27:before{
			left: 50px;
			top: 50px;
			transition: all 2s cubic-bezier(0.42, 0, 0.58, 1) -0.5s;
		}
		.bird--3:before,
		.bird--6:after,
		.bird--10:before,
		.bird--11:before,
		.bird--14:after,
		.bird--15:before,
		.bird--20:after,
		.bird--22:before,
		.bird--24:after,
		.bird--25:after,
		.bird--25:before,
		.bird--5:before{
			left: 100px;
			top: -10px;
			transition: all 2s cubic-bezier(0.42, 0, 0.58, 1) -0.5s;
		}	
		
	}
	
	//size of two birds
	.bird,
	.bird:before,
	.bird:after,
	.bird--1,
	.bird--1:after,
	.bird--1:before,
	.bird--2,
	.bird--2:after,
	.bird--2:before,
	.bird--3,
	.bird--3:after,
	.bird--3:before,
	.bird--4,
	.bird--4:after,
	.bird--4:before,
	.bird--5,
	.bird--5:after,
	.bird--5:before,
	.bird--6,
	.bird--6:after,
	.bird--6:before,
	.bird--7,
	.bird--7:after,
	.bird--7:before,
	.bird--8,
	.bird--8:after,
	.bird--8:before,
	.bird--9,
	.bird--9:after,
	.bird--9:before,
	.bird--10,
	.bird--10:after,
	.bird--10:before,
	.bird--11,
	.bird--11:after,
	.bird--11:before,
	.bird--12,
	.bird--12:after,
	.bird--12:before,
	.bird--13,
	.bird--13:after,
	.bird--13:before,
	.bird--14,
	.bird--14:after,
	.bird--14:before,
	.bird--15,
	.bird--15:after,
	.bird--15:before,
	.bird--16,
	.bird--16:after,
	.bird--16:before,
	.bird--17,
	.bird--17:after,
	.bird--17:before,
	.bird--18,
	.bird--18:after,
	.bird--18:before,
	.bird--19,
	.bird--19:after,
	.bird--19:before,
	.bird--20,
	.bird--20:after,
	.bird--20:before,
	.bird--21,
	.bird--21:after,
	.bird--21:before,
	.bird--22,
	.bird--22:after,
	.bird--22:before,
	.bird--23,
	.bird--23:after,
	.bird--23:before,
	.bird--24,
	.bird--24:after,
	.bird--24:before,
	.bird--25,
	.bird--25:after,
	.bird--25:before,
	.bird--26,
	.bird--26:after,
	.bird--26:before,
	.bird--27,
	.bird--27:after,
	.bird--27:before,
	.bird--28,
	.bird--28:after,
	.bird--28:before,
	.bird--29,
	.bird--29:after,
	.bird--29:before,
	.bird--30,
	.bird--30:after,
	.bird--30:before {
		opacity: 1;
	  display:block;
	  position: absolute;
	  background-image: url('/images/birds.svg');
	  background-size: auto 100%;
	  width: $widthBird2;
      height: $heightBird2;
      top: 0;
      left: 0;
	  animation-name: fly-cycle;
	  animation-timing-function: steps(3);
	  animation-iteration-count: infinite;
	}
	//size of one bird
	.bird--1:after,
	.bird--1:before,
	.bird--2:after,
	.bird--2:before,
	.bird--4:after,
	.bird--4:before,
	.bird--5:after,
	.bird--5:before,
	.bird--7:after,
	.bird--7:before,
	.bird--8:after,
	.bird--8:before,
	.bird--10:after,
	.bird--10:before,
	.bird--11:after,
	.bird--11:before,
	.bird--13:after,
	.bird--13:before,
	.bird--14:after,
	.bird--14:before,
	.bird--16:after,
	.bird--16:before,
	.bird--17:after,
	.bird--17:before,
	.bird--18,
	.bird--18:after,
	.bird--18:before,
	.bird--19,
	.bird--19:after,
	.bird--19:before,
	.bird--20:after,
	.bird--20:before,
	.bird--21,
	.bird--21:after,
	.bird--21:before,
	.bird--22,
	.bird--22:after,
	.bird--22:before,
	.bird--23,
	.bird--23:after,
	.bird--23:before,
	.bird--24,
	.bird--24:after,
	.bird--24:before,
	.bird--25,
	.bird--25:after,
	.bird--25:before,
	.bird--26,
	.bird--26:after,
	.bird--26:before,
	.bird--27,
	.bird--27:after,
	.bird--27:before,
	.bird--28,
	.bird--28:after,
	.bird--28:before,
	.bird--29,
	.bird--29:after,
	.bird--29:before,
	.bird--30,
	.bird--30:after,
	.bird--30:before{
		width: var(--widthBird1);
    height: var(--heightBird2);
    top: -8px;
    left: 8px;
    z-index: -100;
	}
	.bird--21,
	.bird--22,
	.bird--23,
	.bird--24,
	.bird--25,
	.bird--26,
	.bird--27,
	.bird--28,
	.bird--29{
		top: 0;
	}
	
	.bird--22,
	.bird--25,
	.bird--28{
		top: var(--sizeh4);
	}

	.bird--23,
	.bird--26,
	.bird--29{
		top: calc(2 * var(--sizeh4) - 5px);
	}
	.bird--24,
	.bird--25,
	.bird--26{
		left: calc(var(--sizew4fore) + 15px);
	}
	.bird--27,
	.bird--28,
	.bird--29{
		left: calc(2 * var(--sizew4fore) + 20px);
	}
	.bird--18{
		top:0;
		left:0;
	}
	.bird--18:after,
	.bird--18:before{
		left: -20px;
	}
	.bird--19:after,
	.bird--19:before{
		left: -10px;
	}
	.bird--1:before,
	.bird--4:before,
	.bird--7:before,
	.bird--10:before,
	.bird--13:before,
	.bird--16:before,
	.bird--19:before{
      	top: 18px;
	}
	.bird--2:after,
	.bird--5:after,
	.bird--8:after,
	.bird--11:after,
	.bird--14:after,
	.bird--17:after,
	.bird--20:after{
      	top: -18px;
      	left: 12px
	}
	.bird--20:after,
	.bird--20:before,
	.bird--21:after{
      	left: 27px
	}
	.bird--2:before,
	.bird--5:before,
	.bird--8:before,
	.bird--11:before,
	.bird--14:before,
	.bird--17:before,
	.bird--20:before{
      	top: -36px;
      	left: 12px
	}
	.bird--21:before,
	.bird--22:before,
	.bird--23:before,
	.bird--24:before,
	.bird--25:before,
	.bird--26:before{
      	top: 10px;
    	left: 45px;
	}
	.bird--21:after,
	.bird--22:after,
	.bird--23:after,
	.bird--24:after,
	.bird--25:after,
	.bird--26:after,
	.bird--27:after,
	.bird--28:after,
	.bird--29:after{
      	left: 10px;
    	top: 4px;
	}
	.bird--27:before,
	.bird--28:before,
	.bird--29:before{
    	left: -45px;
    	top: 10px;
	}

	.bird:before,
	.bird:after,
	.bird--1:after,
	.bird--1:before,
	.bird--2:before,
	.bird--2:after,
	.bird--3:after,
	.bird--3:before,
	.bird--4:after,
	.bird--4:before,
	.bird--5:after,
	.bird--5:before,
	.bird--6:after,
	.bird--6:before,
	.bird--7:after,
	.bird--7:before,
	.bird--8:after,
	.bird--8:before,
	.bird--9:after,
	.bird--9:before,
	.bird--10:after,
	.bird--10:before,
	.bird--11:after,
	.bird--11:before,
	.bird--12:after,
	.bird--12:before,
	.bird--13:after,
	.bird--13:before,
	.bird--14:after,
	.bird--14:before,
	.bird--15:after,
	.bird--15:before,
	.bird--16:after,
	.bird--16:before,
	.bird--17:after,
	.bird--17:before,
	.bird--18:after,
	.bird--18:before,
	.bird--19:after,
	.bird--19:before,
	.bird--20:after,
	.bird--20:before,
	.bird--21:after,
	.bird--21:before,
	.bird--22:after,
	.bird--22:before,
	.bird--23:after,
	.bird--23:before,
	.bird--24:after,
	.bird--24:before,
	.bird--25:after,
	.bird--25:before,
	.bird--26:after,
	.bird--26:before,
	.bird--27:after,
	.bird--27:before,
	.bird--28:after,
	.bird--28:before,
	.bird--29:after,
	.bird--29:before,
	.bird--30:after,
	.bird--30:before{
		content: '';
	}
	.bird:before,
	.bird--3:before,
	.bird--12:before,
	.bird--15:before,
	.bird--6:before,
	.bird--9:before,
	.bird--18:before{
		top: 10px;
	}
	.bird:after,
	.bird--6:after,
	.bird--12:after,
	.bird--15:after,
	.bird--9:after,
	.bird--18:after{
		top: calc(var(--sizeh4) + 10px);
	}
	.bird--3:after{
		left: -10px;
	}
	.bird--3:after{
		top: calc(var(sizeh4) + 15px);
	}
	.bird--1,
	.bird--4,
	.bird--7,
	.bird--10,
	.bird--13,
	.bird--16,
	.bird--19{
		top: var(--sizeh4);
	}
	.bird--2{
		top: calc(2 * var(--sizeh4) - 5px);
	}
	.bird--5{
		top: (2 * var(--sizeh4) - 3px);
		left: 25px;
	}
	
	.bird--8,
	.bird--11,
	.bird--14,
	.bird--17,
	.bird--20{
		top: calc(2 * var(--sizeh4));
	}
	.bird--3,
	.bird--4{
		left: var(--sizew4);
	}
	.bird--6,
	.bird--7,
	.bird--8{
		left: calc(2 * var(--sizew4));
	}
	.bird--9,
	.bird--10,
	.bird--11{
		left: calc(3 * var(--sizew4));
	}
	.bird--12,
	.bird--13,
	.bird--14{
		left: calc(4 * var(--sizew4));
	}
	.bird--15,
	.bird--16,
	.bird--17{
		left: calc(3.5 * var(--sizew4));
	}
	.bird--20{
		left: calc(2 * var(--sizew4) - 10px);
	}
	.bird--18,
	.bird--19{
		left: calc(2.5 * var(--sizew4) - 10px);
	}
	.bird--30,
	.bird--30:after,
	.bird--30:before{
		left: calc(2 * var(--sizew4));
		top: 0;
	}
	.bird--30:before{
		top: var(--sizeh4);
	}
	.bird--30:after{
		top: 20px;
	}
	.active,
	
	.button-bird:hover	.bird,
	.button-bird:hover	.bird:before,
	.button-bird:hover	.bird--3,
	.button-bird:hover	.bird--4,
	.button-bird:hover	.bird--4:after,
	.button-bird:hover	.bird--4:before,
	.button-bird:hover	.bird--9,
	.button-bird:hover	.bird--9:after,
	.button-bird:hover	.bird--13,
	.button-bird:hover	.bird--13:after,
	.button-bird:hover	.bird--13:before,
	.button-bird:hover	.bird--15,
	.button-bird:hover	.bird--16,
	.button-bird:hover	.bird--18,
	.button-bird:hover	.bird--21,
	.button-bird:hover	.bird--21:after,
	.button-bird:hover	.bird--27:before,
	.button-bird:hover	.bird--24,
	.button-bird:hover	.bird--24:after,
	.button-bird:hover	.bird--24:before,
	.button-bird:hover	.bird--27,
	.button-bird:hover	.bird--27:after,
	.button-bird:hover	.bird--27:before,
	.button-bird:hover	.bird--30:before {
			animation-duration: 0.5s;
			animation-delay: -0.5s;
		}
		
	.button-bird:hover	.bird--1,
	.button-bird:hover	.bird--1:after,
	.button-bird:hover	.bird--3:before,
	.button-bird:hover	.bird--5,
	.button-bird:hover	.bird--5:after,
	.button-bird:hover	.bird--5:before,
	.button-bird:hover	.bird--7,
	.button-bird:hover	.bird--7:after,
	.button-bird:hover	.bird--7:before,
	.button-bird:hover	.bird--9:before,
	.button-bird:hover	.bird--10,
	.button-bird:hover	.bird--10:after,
	.button-bird:hover	.bird--10:before,
	.button-bird:hover	.bird--14,
	.button-bird:hover	.bird--14:after,
	.button-bird:hover	.bird--14:before,
	.button-bird:hover	.bird--17,
	.button-bird:hover	.bird--17:after,
	.button-bird:hover	.bird--17:before,
	.button-bird:hover	.bird--19,
	.button-bird:hover	.bird--19:after,
	.button-bird:hover	.bird--19:before,
	.button-bird:hover	.bird--18:after,
	.button-bird:hover	.bird--22,
	.button-bird:hover	.bird--22:after,
	.button-bird:hover	.bird--22:before,
	.button-bird:hover	.bird--25,
	.button-bird:hover	.bird--25:after,
	.button-bird:hover	.bird--25:before,
	.button-bird:hover	.bird--28,
	.button-bird:hover	.bird--28:after,
	.button-bird:hover	.bird--28:before,
	.button-bird:hover	.bird--30:after {
		  animation-duration: 0.7s;
		  animation-delay: -0.5s;
		}
	.button-bird:hover	.bird:after,
	.button-bird:hover	.bird--1:before,
	.button-bird:hover	.bird--2,
	.button-bird:hover	.bird--2:before,
	.button-bird:hover	.bird--2:after,
	.button-bird:hover	.bird--3:after,
	.button-bird:hover	.bird--6,
	.button-bird:hover	.bird--6:after,
	.button-bird:hover	.bird--6:before,
	.button-bird:hover	.bird--8,
	.button-bird:hover	.bird--8:after,
	.button-bird:hover	.bird--8:before,
	.button-bird:hover	.bird--11,
	.button-bird:hover	.bird--11:after,
	.button-bird:hover	.bird--11:before,
	.button-bird:hover	.bird--12,
	.button-bird:hover	.bird--12:after,
	.button-bird:hover	.bird--12:before,
	.button-bird:hover	.bird--16,
	.button-bird:hover	.bird--16:after,
	.button-bird:hover	.bird--16:before,
	.button-bird:hover	.bird--20,
	.button-bird:hover	.bird--20:after,
	.button-bird:hover	.bird--20:before,
	.button-bird:hover	.bird--18:before,
	.button-bird:hover	.bird--23,
	.button-bird:hover	.bird--23:after,
	.button-bird:hover	.bird--23:before,
	.button-bird:hover	.bird--26,
	.button-bird:hover	.bird--26:after,
	.button-bird:hover	.bird--26:before,
	.button-bird:hover	.bird--29,
	.button-bird:hover	.bird--29:after,
	.button-bird:hover	.bird--29:before,
	.button-bird:hover	.bird--30 {
		  animation-duration: 0.6s;
		  animation-delay: -0.75s;
		}
*/


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
					filter: var(--button-bird-color);
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
					filter: var(--button-bird-color);
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
      </style>
			<svg id="defs">
				<defs>
					<symbol id="ficon" viewBox="0 0 66.836823 36.261105">
					<path d="m 16.9,32.3 c 3.1,-0.7 2.9,-2.3 2,1 C 28,37.7 39.3,37 48,32.5 v 0 c 0.7,-2.1 1,-3.9 1,-3.9 0.6,0.8 0.8,1.7 1,2.9 4.1,-2.3 7.6,-5.3 10.2,-8.3 0.4,-2.2 0.4,-4 0.4,-4.1 0.6,0.4 0.9,1.2 1.2,2.1 C 66.3,15.1 67.2,10 65.5,7.7 66.6,5.1 67.1,2.3 66.7,0 66.2,2.4 65.5,4.7 64.6,7.1 58.8,18.6 47.7,29 34.3,32.4 47.3,28.4 57.9,18 63.4,6.8 58.9,9.7 51.7,17.2 40.8,21.4 c 2.1,0.7 3.5,1.1 3.5,1.6 -0.1,0.4 -1.3,0.6 -3.2,0.4 -7,-0.9 -7.1,1.2 -16,1.5 1,1.3 2,2.5 3.1,3.6 C 26.3,27.6 24.4,26.3 22.6,24.9 21.7,25 12.3,29.8 0,12.6 c 2,5.8 7.9,15 16.9,19.7 z" />
					</symbol>
					<symbol id="bicon" viewBox="0 0 180 69.539766">

					<path d="m 8.7598116,37.861293 c 5.7456834,-1.978022 11.4913654,-3.390895 15.2590264,-1.978022 3.767661,1.412873 7.441131,2.166405 11.208792,3.579278 2.825745,1.036107 9.32496,1.22449 13.751962,-2.072214 2.731554,-1.978021 6.687598,-4.615384 11.020408,0 C 59.811617,35.977463 58.587127,34.752973 58.304553,33.811058 57.927787,32.492376 58.021978,31.738844 56.609105,30.23178 54.536892,28.065375 51.711146,28.724715 50.10989,28.913098 47.095762,29.289865 46.813187,27.123459 47.378336,24.768671 47.943485,22.413883 58.210361,3.858153 55.855573,1.9743225 52.653061,-0.28627405 48.602826,-0.56884865 45.11774,0.93821575 40.031397,3.2930038 29.481947,15.349519 26.750393,18.363648 c -3.390895,3.767661 -0.09419,9.984301 -0.09419,9.984301 0,0 2.731554,4.050236 -5.086342,2.44898 C 16.6719,29.666631 0,31.45627 0,31.45627 Z"/>
					<path d="m 106.8877,30.468291 c 1.76135,0.09785 5.08835,-0.684971 6.84971,0.09785 1.95706,0.97853 2.15276,1.663501 3.13129,2.739884 0.68497,0.880677 2.34848,1.565648 3.1313,2.739884 -4.69694,-2.054913 -9.39389,1.272089 -9.98101,1.761354 -1.27209,0.97853 -2.25062,2.348472 -2.73988,3.91412 v 0 c -1.4678,3.914121 -7.534682,28.768784 -9.10033,27.790254 -2.446325,-1.467795 -7.143269,-4.794798 -8.415358,-8.1218 -2.152766,-5.479768 -2.739884,-17.907099 -8.708918,-21.82122 -5.773327,-3.718414 -11.644507,-4.990503 -17.026422,-2.837737 -5.381916,2.152766 -3.816268,-1.663501 -3.816268,-1.663501 0,0 20.353425,-4.011973 29.551608,-5.381915 9.198182,-1.369942 14.188688,0.587118 17.124278,0.782824 z"/>
					<path d="m 172.1751,34.772704 c 1.17373,-0.293434 3.12996,-0.684679 7.8249,1.369357 -0.78249,-1.173735 -2.34747,-1.956225 -3.12996,-2.738715 -0.8803,-1.075925 -1.07592,-1.858415 -3.12996,-2.738716 -1.66279,-0.782491 -4.98838,0.09781 -6.84679,-0.09781 -2.93434,-0.195622 -8.02053,-2.249659 -17.21479,-0.78249 -9.19426,1.467169 -29.44119,5.379621 -29.44119,5.379621 0,0 -1.66279,3.81464 3.81464,1.662791 5.47743,-2.151848 15.35637,-2.151848 20.14912,-0.195622 2.15185,0.78249 4.01026,2.151848 5.47743,3.912451 2.15185,2.347471 4.49932,13.204523 6.9446,14.671692 1.17374,0.684679 5.96649,-6.846789 8.50959,-11.248297 2.44528,1.662792 5.2818,2.934338 8.21614,3.619017 0.48906,0.09781 -1.95622,-8.607392 -3.03215,-12.030787 0.58687,-0.391245 1.17374,-0.586868 1.85842,-0.78249 z"/>
					</symbol>
				<defs>
			</svg>
      <button @click=${this._restartAnimations}>

				${cache(this.showFeather ? html`
				<svg id="feather" class="feather" ><use xlink:href="#ficon"></use></svg>`: '')}
					${cache([...Array(40).keys()].map(k => {
					const finalLeft = Math.random() * 150 + 50;
					const finalTop= Math.random() * 200 + 50;
					const birdStyle = `left:${finalLeft}px;top:-${finalTop}px;`	
					return html`
					<div style="${birdStyle}" class="bird ${classMap({
						birdonhover: k < 5,
						flying: this.showBirds,
						alpha: k % 4 === 0,
						beta: k % 4 === 1,
						gamma: k % 4 === 2,
						delta: k % 4 === 3
					})}"><svg class="birdicon"><use xlink:href="#bicon"></svg></div>`}))}		
				<div id="text"><slot></slot></div>
    </button>
    `;
	}
	_restartAnimations() {
		this.showBirds = true;
		this.showFeather = true;
		setTimeout(() => this.showBirds= false,250);
		setTimeout(() => this.showFeather = false, 4000);
	}
}
customElements.define('send-button', SendButton);