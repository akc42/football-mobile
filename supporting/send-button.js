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
import { LitElement, html , css} from '../client/libs/lit-element.js';
import { cache } from '../client/libs/cache.js';
import {classMap} from '../client/libs/class-map.js';

import button from '../client/styles/button.js';
/*
     <send-button>
*/
class SendButton extends LitElement {
  static get styles() {
		return [button, css`
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
					filter: var(--accent-color-filter);
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
					filter: var(--accent-color-filter);
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
		`];
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