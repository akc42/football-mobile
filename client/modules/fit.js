/**
    @licence
    Copyright (c) 2019 Alan Chandler, all rights reserved

    This file is part of PASv5, an implementation of the Patient Administration
    System used to support Accuvision's Laser Eye Clinics.

    PASv5 is licenced to Accuvision (and its successors in interest) free of royality payments
    and in perpetuity in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
    implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. Accuvision
    may modify, or employ an outside party to modify, any of the software provided that
    this modified software is only used as part of Accuvision's internal business processes.

    The software may be run on either Accuvision's own computers or on external computing
    facilities provided by a third party, provided that the software remains soley for use
    by Accuvision (or by potential or existing customers in interacting with Accuvision).
*/

/*
  PasFit is a Mixin to fit the element is is associated with

  called with new PasFit(fitee);  Where fitee it the element to be fitted.  The remainder of the properties
  listed below are set on the instance created by new.

  The element listens for resize event
*/
import '../elements/dialog-polyfill.js';
import dialog from '../styles/dialog.js';


const PasFit = superClass => class extends superClass {
  static get styles() {
    return [dialog];
  }
  static get properties() {
    return {
      /**
       * position the sizingTarget according to the string.  Possible Values are
       *
       *  'target'  look for a "positionTarget" object and fit it near that
       *  'centre'  centre the item in the "fitInto" element
       *  'bottom'  align to the bottom center of the fitInto element
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
export default PasFit;