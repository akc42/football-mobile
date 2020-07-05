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


/*
  AppFit is a Mixin to fit the element is is associated with

  called with new AppFit(fitee);  Where fitee it the element to be fitted.  The remainder of the properties
  listed below are set on the instance created by new.

  The element listens for resize event
*/
import '../elements/dialog-polyfill.js';
import dialog from '../styles/app-overlay.js';


const AppFit = superClass => class extends superClass {
  static get styles() {
    return [dialog];
  }
  static get properties() {
    return {
      /**
       * position the sizingTarget according to the string.  Possible Values are
       *
       *  'target'  look for a "positionTarget" object and fit it near that
       *  'right'   look for a "positionTarget" onject and try and fit just to the right of it, matching tops if possible.
       *  'centre'  centre the item in the "fitInto" element
       *  'bottom'  align to the bottom center of the fitInto element
       *  'top'     align to the to centre of the fitInto element (but a this.topOffset Down)
       */
      position: {type: String},
      /*
       * percentage (between 1 and 100) of the maximum size of the sizing element against
       * ths object it is fitting into.
       */
      maxSize: {type: Number},
      //Offset if position is top
      topOffset: {type: Number}

    };
  }
  constructor() {
    super();
    this.nativeDialog = !!window.HTMLDialogElement;  //store it so we can change it in testing later
    this.sizingTarget = this;
    this.fitInto = window;
    this.position = 'target';
    this.maxSize = 95;
    this.topOffset = 90;
    this.resizeInProgress = false;
    this._resize = this._resize.bind(this);
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener('resize', this._resize);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('resize', this._resize);
  }
  async fit() {
    if (this.nativeDialog) {
      this._resize();
    } else {
      await this.sizingTarget.updateComplete;
      this._fit();
    }
  }
  _fit() {
    let top;
    let left;
    let width;
    let height;

    //reset existing maxHeight and widthStyles before measuring again
    this.sizingTarget.style.height = null;
    this.sizingTarget.style.width = null;

    const sizingRect = this._getNormalizedRect(this.sizingTarget);
    const intoRect = this._getNormalizedRect(this.fitInto);
    width = sizingRect.width;
    height = sizingRect.height;
    if (width > (intoRect.width * this.maxSize / 100)) {
      width = (intoRect.width * this.maxSize / 100);
      this.sizingTarget.style.width = width.toString() + 'px';
    }
    if (height > (intoRect.height * this.maxSize / 100)) {
      height = (intoRect.height * this.maxSize / 100);
      this.sizingTarget.style.height = height.toString() + 'px';
    }

    if (this.position === 'centre') {
      left = (intoRect.right + intoRect.left - width ) / 2;
      top = (intoRect.top + intoRect.bottom - height) /2;
    } else if (this.position === 'bottom' ){
      left = (intoRect.right + intoRect.left - width ) / 2;
      top = intoRect.bottom - height;
    } else if (this.position === 'top') {
      left = (intoRect.right + intoRect.left - width ) / 2;
      top = intoRect.top + this.topOffset; //allow margin at top
    } else {
      if (!this.positionTarget) {
        //We haven't got a position target so work out our parent (the default)
        this.positionTarget = this.parentNode;
        if (!this.positionTarget) return; //can't do anything without positionTarget
        //if parent is boundary (document fragment) then we need our host
        if (this.positionTarget.nodeType === 11) this.positionTarget = this.positionTarget.host;
      }
      const positionRect = this._getNormalizedRect(this.positionTarget);

      if (positionRect.right < intoRect.left) {
        //position target is off to the left, so we left align
        left = intoRect.left;
      } else if (positionRect.left > intoRect.right) {
        //position is off to the right, so we align right
        left = intoRect.right - width;
      } else if (this.position === 'right') {
        left = positionRect.right;  //ideally we would like to be here, but the right may push us in
        if (left + width > intoRect.right) left = intoRect.right - width;
      } else {
        // natural position will be aligned center to centre with target, but may alter later
        left = (positionRect.right + positionRect.left - width )/ 2;
      }
      if (positionRect.bottom < intoRect.top) {
        //position is above top, so align to top
        top = intoRect.top;
      } else if (positionRect.top > intoRect.bottom) {
        //position below bottom so align to bottom
        top = intoRect.bottom - height;
      } else if (this.position === 'right') {
        if (positionRect.top < intoRect.top) {
          //the top of our positioning target is above the top of are limit, so adjust to the limit;
          top = intoRect.top
        } else if ( positionRect.top + height > intoRect.bottom) {
          //our bottom would be below the button, so we need to come up a bit
          top = intoRect.bottom - height;
        } else {
          //ideally we align our tops
          top = positionRect.top;
        }
      } else {
        /*
          This is more complex we first try to align below our position target
        */
        if (positionRect.bottom + height <= intoRect.bottom) {
          //it fits below, so place it there
          top = positionRect.bottom;
          if (left < intoRect.left) {
            left = intoRect.left;
          } else if (left + width > intoRect.right) {
            left = intoRect.right - width;
          } // else left is fine where it is
        } else if (positionRect.top - height >= intoRect.top) {
          //it fits above position target, so place it there
          top = positionRect.top - height;
          if (left < intoRect.left) {
            left = intoRect.left;
          } else if (left + width > intoRect.right) {
            left = intoRect.right - width;
          } // else left is fine where it is
        } else if (positionRect.right + width <= intoRect.right) {
          //we fit to right of position target so place it there
          left = positionRect.right;
          top = intoRect.bottom - height;
        } else if (positionRect.left - width >= intoRect.left) {
          //we fit to the left of position target to place it there
          left = positionRect.left - width;
          top = intoRect.bottom - height;
        } else {
          //We are going to have to overlay our position target somewhat, so just place in bottom left corner
          left = intoRect.left;
          top = intoRect.bottom - height;
        }
      }
    }
    this.sizingTarget.style.top = top.toString() + 'px';
    this.sizingTarget.style.left = left.toString() + 'px';
  }
  _getNormalizedRect(target) {
    if (target === document.documentElement || target === window) {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        right: window.innerWidth,
        bottom: window.innerHeight
      };
    }
    return target.getBoundingClientRect();
  }
  _resize() {
    if (this.resizeInProgress) return;
    this.resizeInProgress = true;
    requestAnimationFrame(() => {
      //Do resize calc
      this._fit();
      this.resizeInProgress = false;
    });
  }

};
export default AppFit;
