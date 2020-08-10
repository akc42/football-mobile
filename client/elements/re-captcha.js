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
import { LitElement, html, css } from '../libs/lit-element.js';
import {cache} from '../libs/cache.js';

import api from '../modules/api.js';
import global from '../modules/globals.js';
import error from '../styles/error.js';

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
    return [error, css`        
      #reserve {
        width: 364px;
        height: 78px;
        margin-top: 5px;
      }
      @media (max-width: 300px) {
        #reserve {
          width: 278px;
          height: 60px;
        }
      }
    `];
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
    //append an absolute div to the body in which to render our div.
    this.float = document.createElement('div'); 
    const captchaId = `captcha_${instance++}`;
    this.float.setAttribute('id', captchaId)
    this.float.style = 'position:absolute;';
    document.body.appendChild(this.float);
    recaptcha.then(grepcaptcha => 
      this.captchaId = grepcaptcha.render(this.float,{
        'sitekey': global.reCaptchaKey,
        'theme': 'light' ,
        'callback': this._captured
      })
    );
    this.resizeObserver.observe(document.body);
    if (this.reserve !== undefined) this.resizeObserver.observe(this.reserve);
    if (this.errorcontainer !== undefined) this.resizeObserver.observe(this.errorcontainer);

    let parent = this;
    while (parent = parent.parentNode) {
      parent.addEventListener('scroll', this._scroll);
    }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.float) this.float.remove();  //take our recapture element away if we haven't already
    this.isScrolling = false;
    this.captureCompleted = false;
    this.resizeObserver.disconnect();
    
    let parent = this;
    while (parent = parent.parentNode) {
      parent.removeEventListener('scroll', this._scroll);
    }

  }
  firstUpdated() {
    this.reserve = this.shadowRoot.querySelector('#reserve');
    this.errorcontainer = this.shadowRoot.querySelector('#errorcontainer');
    this.resizeObserver.observe(this.reserve);
    this.resizeObserver.observe(this.errorcontainer);
  }

  render() {
    return html`
      <div id="errorcontainer">
        ${cache(this.invalid ? html`
          <div class="error" role="alert">
            <material-icon>cancel</material-icon><span>${this.message}</span>
          </div>
        `: '')}
      </div>
      <!-- we reserve space in the dom for this -->
      <div id="reserve"></div>
    `;
  }
  validate() {
    if (!this.captureCompleted) {
      this.invalid = true;
    }
    return !this.invalid;
  }
  _captured(token) {
    //I don't want the client to see my secret key, so I am going to send the token to my server, and it can do the validation
    api('session/recaptcha_verify',{token:token}).then(response => {
      if (response.success) {
        this.captureCompleted = true;
        this.invalid = false;
        this.float.remove();
        this.float = null;
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
    if (this.reserve !== undefined && this.float !== null) {

      const rbox = this.reserve.getBoundingClientRect();
      if (rbox.width < 364) {
        const scaling = rbox.width/364;
        this.float.style.transformOrigin =  'left top';
        this.float.style.transform = `scale(${scaling})`;
      }
      this.float.style.left = rbox.left + 'px';
      this.float.style.top = rbox.top + 'px';
      this.float.style.width = rbox.width + 'px';
      this.float.style.height = rbox.height + 'px';
    }
  }
}
customElements.define('re-captcha', ReCaptcha);




