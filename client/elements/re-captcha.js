/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file is part of Football-Mobile.

    Football-Mobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Football-Mobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Football-Mobile.  If not, see <http://www.gnu.org/licenses/>.
*/
import { LitElement, html } from '../libs/lit-element.js';
import api from '../modules/api.js';
import global from '../modules/globals.js';

let instance = 1;

const recaptcha = new Promise(function (resolve, reject) {
  window.recaptchaElementCallback = function () {
    resolve(window.grecaptcha);  //grecaptcha is a global object that the script element I am about to add delivers
  };

  const head = document.getElementsByTagName('head')[0];
  const script = document.createElement('script');
  script.setAttribute('async', '');
  script.setAttribute('id', 'grecaptchaLibrary');
  script.setAttribute('defer', '');
  script.setAttribute('src', 'https://www.google.com/recaptcha/api.js?onload=recaptchaElementCallback&render=explicit');
  head.appendChild(script);
});


/*
     <re-captcha>
*/
class ReCaptcha extends LitElement {
  static get styles() {
    return [];
  }
  static get properties() {
    return {
      invalid: {type: Boolean}, //failed to provide capture response
      message: {type: String}  //Error message to display when invalid
    };
  }
  constructor() {
    super();
    this.invalid = false;
    this.captureCompleted = false;
    this.message = 'Captcha Not Completed';
    this._setLocationOfBodyFloat = this._setLocationOfBodyFloat.bind(this);
    this._scroll = this._scroll.bind(this);
    this._captured = this._captured.bind(this);
    this.isScrolling = false;
    this.resizeObserver = new ResizeObserver(this._setLocationOfBodyFloat);

  }
  connectedCallback() {
    super.connectedCallback();
    const cssColor = getComputedStyle(document.documentElement).getPropertyValue('--background-color');
    const ctx = document.createElement("canvas").getContext("2d");
    ctx.fillStyle = cssColor;
    let color = ctx.fillStyle;
    // If RGB --> Convert it to HEX: http://gist.github.com/983661
    color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));
    const r = color >> 16;
    const g = color >> 8 & 255;
    const b = color & 255;
    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
    //append an absolute div to the body in which to render our div.
    this.float = document.createElement('div'); 
    const captchaId = `captcha_${instance++}`;
    this.float.setAttribute('id', this.captchaId)
    this.float.style = 'position:absolute;';
    document.body.appendChild(this.float);
    recaptcha.then(grepcaptcha => 
      grepcaptcha.render(this.captureId,{
        'sitekey': global.reCaptchaKey,
        'theme': hsp > 127.5 ? 'light' : 'dark',
        'callback': this._captured
      })
    );
    if (this.reserver !== undefined) {
      this.resizeObserver.observe(this.reserve);
    }
    let parent = this;
    while (parent = parent.parentNode) {
      parent.addEventListener('scroll', this._scroll);
    }

  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.float.remove();  //take our recapture element away
    this.isScrolling = false;
    this.captureCompleted = false;
    this.resizeObserver.unobserve(this.reserve);
    let parent = this;
    while (parent = parent.parentNode) {
      parent.removeEventListener('scroll', this._scroll);
    }
  }
  update(changed) {
    super.update(changed);
  }
  firstUpdated() {
    this.reserve = this.shadowRoot.querySelector('#reserve');
    this.resizeObserver.observe(this.reserve);

  }
  updated(changed) {
    super.updated(changed);
  }
  render() {
    return html`
      <style>
        #reserve {
          width: 398px;
          height: 98px;
        }
      </style>
      <div class="error">${this.invalid? this.message: ' '}</div>
      <!-- we reserve space in the dom for this -->
      <div id="reserve"></div>
    `;
  }
  validate() {
    if (!this.captureCompleted) {
      this.invalid = false;
    }
    return !this.invalid;
  }
  _captured(token) {
console.log('captured called with token', token);
    //I don't want the client to see my secret key, so I am going to send the token to my server, and it can do the validation
    api('session/recaptcha_verify',{token:token}).then(response => {
      if (response.success) {
        this.captureCompleted = true;
        this.invalid = false;
      } else {
        this.invalid = true;
        window.grecaptcha.reset(this.captchaId);
      }
    })
  }
  _scroll() {
    if (this.isScrolling) return;
    this.isScrolling = true;
    requestAnimationFrame(() => {
      this._setLocationOfBodyFloat();
      this.isScrolling = false;
    });

  }
  _setLocationOfBodyFloat() {
    if (this.reserve !== undefined) {
      const rect = this.reserve.getBoundingClientRect();
      this.float.style.left = rect.left + 'px';
      this.float.style.top = rect.top + 'px';
      this.float.style.width = rect.width + 'px';
      this.float.style.height = rect.height + 'px';
    }
  }
}
customElements.define('re-captcha', ReCaptcha);




