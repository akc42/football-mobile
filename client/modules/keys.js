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
    `keys` is a module that provides keyboard support by normalising key
    handling amongst browsers and providing a simple interface that can be used
    by the application.  Each keyboard usage request the user create a new
    instance of the AppKeys class passing the key target in to the constructor.
    This module will add and event handler for itself to that key target for the
    keydown event.  On that event it will parse the key combinations pressed and
    fire a "key-pressed" event on the target.

    The key grammer is of the form [<modifier>+]<key>[:<event>] and each of these is
    space separated.  optional <modifiers> (default none) are shift ctrl alt meta, and the optional 
    <events> are keydown and keyup (keydown is used as default) 

    To allow a using module the freedom to connect and disconnect to the dom, we
    provide two methods to be called during the disconnectCallback and
    connectCallback to disconnect and reconnect to this event

    There are two models of using this, the first, shown below allows an element to add
    the keys event to document body.  This is good for pages that are swapped in and
    out by a paging mechanism so that only one page is in the dom at a given time This is
    good if only one handler is needed for the entire page.

    NOTE: If you take this approach limit the keys to non function keys as the main app, with its main 
    menu may add a handler for the function keys and both menus, and any actions you choose would run at the same time.

    constructor() {
      super();
      ...
      this._keyPressed = this._keyPressed.bind(this);
    }
    connectedCallback() {
      super.connectedCallback();
      document.body.addEventListener('key-pressed', this._keyPressed);
      if (this.keys === undefined) {
        this.keys = new AppKeys(document.body, 'Enter Esc'); //list the keys you want to identify (see comment above for grammer)
      } else {
        this.keys.connect();
      }
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      this.keys.disconnect();
      document.body.removeEventListener('key-pressed', this._keyPressed);
    }
    _keyPressed(e) {
      e.key is an string containing the [<modifier>+]<key> combination from one you requested
    }

    The second way of using this, better for when you don't want to react unless a particular area of the page has focus, or
    if there are different areas of the page needing the respond depending which area
    has focus.  This is to create the AppKeys object in the firstUpdated function.  Here is a possible example (just one area)


  connectedCallback() {
    super.connectedCallback();
    if (this.keys !== undefined) this.keys.connect();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.keys.disconnect();
  }
  firstUpdated() {
    this.target = this.shadowRoot.querySelector('#keyreceive');
    this.keys = new AppKeys(this.target, 'Enter');  //replace 'Enter' with space separated string of keys
  }
  Then on the dom element in the Render function
  <div id="keyreceive" @keys-pressed=${this._keyPressed}>Contents</div>

  NOTE: There is no need to bind this._keyPressed to this (as in the first example).  Lit manages it.

  If for any reason you want more info about the keyPress, access
  this.keys.lastPressed, and it will return the complete binding object

  NOTE: I considered making this a mixin to avoid some of this verbosity, but decided in 
  the end the extra was worth it for the flexibility of the different use cases.
*/
/*
      Initial constants are taken from iron-a11y-keys behavior with the following licence.  This same licences applies to those portions.

      Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
      This code may only be used under the BSD style license found at
      http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
      http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
      found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
      part of the polymer project is also subject to an additional IP rights grant
      found at http://polymer.github.io/PATENTS.txt
*/


/**
 * Special table for KeyboardEvent.keyCode. only used when KeyBoardEvent.key can't be
 *
 * Values from:
 * https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent.keyCode#Value_of_keyCode
 */
import {KeyPressed} from './events.js';

const KEY_CODE = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  27: 'esc',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  32: 'space',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  46: 'del',
  106: '*'
};
/**
 * MODIFIER_KEYS maps the short name for modifier keys used in a key
 * combo string to the property name that references those same keys
 * in a KeyboardEvent instance.
 */

const MODIFIER_KEYS = {
  'shift': 'shift',
  'ctrl': 'control',
  'alt': 'alt',
  'meta': 'meta'
};
/**
 * KeyboardEvent.key is mostly represented by printable character made by
 * the keyboard, with unprintable keys labeled nicely.
 *
 * However, on OS X, Alt+char can make a Unicode character that follows an
 * Apple-specific mapping. In this case, we fall back to .keyCode.
 */

const KEY_CHAR = /[a-z0-9*]/;

/**
 * Matches arrow keys in Gecko 27.0+
 */

const ARROW_KEY = /^arrow/;
/**
 * Matches space keys everywhere (notably including IE10's exceptional name
 * `spacebar`).
 */

const SPACE_KEY = /^space(bar)?/;
/**
 * Matches ESC key.
 *
 * Value from: http://w3c.github.io/uievents-key/#key-Escape
 */

const ESC_KEY = /^escape$/;



export default class AppKeys {
  constructor(target, keys, stop) {
    this.stop = stop; //marker to say stop propagation;
    if (!(target instanceof HTMLElement)) throw new Error ('AppKeys required an HTML Element as target');
    this.target = target;
    this.lastPressed = null;
    const keyArray = keys.split(' ');
    this.eventBindings = {};
    for (let keyString of keyArray) {
      const [keyCombo, event] = keyString.split(':');
      const keyBinding = {combo: keyCombo, modifiers: [], hasModifiers: false};
      const keyComboArray = keyCombo.split('+');
      keyBinding.key = keyComboArray.pop();
      if (keyBinding.key.toLowerCase() in MODIFIER_KEYS) {
        //we asked for a modifier so push it back
        keyComboArray.push(keyBinding.key);
      }
      if (keyComboArray.length === 0) {
        //There were no modifiers, but what if we want a single upperCase char
        if (keyBinding.key.length === 1 && keyBinding.key.toLowerCase() !== keyBinding.key) {
          keyBinding.hasModifiers = true;
          keyBinding.modifiers.push('shift');
        }
      } else {
        for (let modifier of keyComboArray) {
          modifier = modifier.toLowerCase();
          if (modifier in MODIFIER_KEYS) {
            keyBinding.hasModifiers = true;
            keyBinding.modifiers.push(modifier);
          }
        }
      }
      keyBinding.key = keyBinding.key.toLowerCase();
      if (this.eventBindings[event ? event : 'keydown'] === undefined) {
        this.eventBindings[event ? event : 'keydown'] = {keyBindings: []};
      }
      this.eventBindings[event ? event : 'keydown'].keyBindings.push(keyBinding);
    }
    this._bindHandlers();
  }
  connect() {
    if (!this.handlersBound) this._bindHandlers();
  }
  disconnect() {
    if (this.handlersBound) {
      for (let event in this.eventBindings) {
        this.target.removeEventListener(event, this.eventBindings[event].boundHandler);
      }
      this.handlersBound = false;

    }
  }
  _bindHandlers() {
    for (let event in this.eventBindings) {
      this.eventBindings[event].boundHandler = this._keyHandler.bind(this, this.eventBindings[event].keyBindings);
      this.target.addEventListener(event, this.eventBindings[event].boundHandler);
    }
    this.handlersBound = true;

  }
  _keyHandler(keyBindings, e) {
    if (this.stop) e.stopPropagation();
    if (e.defaultPrevented) return;
    const key = e.key.toLowerCase();
    let validKey = '';

    if (key === ' ' || SPACE_KEY.test(key)) {
      validKey = 'space';
    } else if (ESC_KEY.test(key)) {
      validKey = 'esc';
    } else if (key.length == 1) {
      if (KEY_CHAR.test(key)) {
        validKey = key;
      } else {
        if (e.keyCode) {
          if (e.keyCode in KEY_CODE) {
            validKey = KEY_CODE[e.keyCode];
          }
        }
      }
    } else if (ARROW_KEY.test(key)) {
      validKey = key.replace('arrow', '');
    } else if (key == 'multiply') {
      // numpad '*' can map to Multiply on IE/Windows
      validKey = '*';
    } else {
      validKey = key;
    }
    for(let binding of keyBindings) {
      if (binding.hasModifiers) {
        let modifierNotFound = false;
        for(let modifier of binding.modifiers) {
          if (!e[modifier + 'Key']) {
            modifierNotFound = true;
            break;
          }
        }
        if (modifierNotFound) return;  //didn't have the right combination of modifiers
        if (binding.key in MODIFIER_KEYS) {
          //we only wanted the modifiers so if our key IS the modifier we wanted
          if (MODIFIER_KEYS[binding.key] === validKey) {
            this.lastPressed = binding;
            if (!this.target.dispatchEvent(new KeyPressed(binding.combo))) {
              e.preventDefault();
              return;
            }
          }
        }
      }
      if (binding.key === validKey) {
        this.lastPressed = binding
        if (!this.target.dispatchEvent(new KeyPressed(binding.combo))) {
          e.preventDefault();
          return;
        }
      }
    }
  }
}
