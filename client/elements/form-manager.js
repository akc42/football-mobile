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
    `<app-form>` Provides a form simulated by ajax
      It looks for children with a validate function to validate the components
      it looks for children with a name and value attribute to pick to send to the url provided.

*/

import { LitElement, html , css} from '../libs/lit-element.js';
import api from '../modules/api.js';
import {ApiError, FormResponse } from '../modules/events.js';

class FormManager extends LitElement  {
  static get styles () {
    return css``;
  }
  static get properties() {
    return {
      action: { type: String }
    };
  }
  constructor() {
    super();
    this.action = '';
    this.inProgress = false;
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
  firstUpdated() {

  }



  render() {
    return html`
      <style>
        :host {
          height: 100%;
        }


      </style>
      <slot id="mychildren"></slot>        
    `;
  }
  get params() {
    return this._params;
  }
  validate() {
    let result = true;
    const slot = this.shadowRoot.querySelector('#mychildren');
    this._walk(slot, node => {
      if (typeof node.validate === 'function') {
        const v = node.validate();
        if (!v) result = false;
      }
      return false;
    });
    return result;
  }
   submit() {
    const result = this.validate();
    if (result) {

      if (!this.inProgress) {
        this._params = {};
        const slot = this.shadowRoot.querySelector('#mychildren');
        this._walk(slot, node => {
          if (node.value !== undefined && node.name !== undefined) {
            this._params[node.name] = node.value;
            return true;
          }
          return false;
        });
        this.inProgress = true
        api(this.action, this.params).then(response => {
          this.inProgress = false;
          this.dispatchEvent(new FormResponse(response))
        }).catch(e => {
          this.inProgress = false;
          throw new ApiError(e.reason);
        });
      } else {
        return false;
      }
    }
    return result;
  }
  _change(e){
    e.stopPropagaton();
    e.target.validate();

  }
  _submit(e) {
    e.preventDefault();
    this.submit();

  }
  _walk(walknode, criteria) {
    this._walkRunner(walknode, criteria, null);
  }
  _walkRunner(node, criteria, slot) {
    if (node.assignedSlot === null || node.assignedSlot === slot) {
      if (node.localName === 'slot') {
        const assignedNodes = node.assignedNodes();
        if (assignedNodes.length === 0) {
          this._walkSub(node.children, criteria);
        } else {
         this._walkSub(assignedNodes.filter(n => n.nodeType === Node.ELEMENT_NODE), criteria, node);
        }
      } else if (!criteria(node)) {
        if (customElements.get(node.localName)) this._walkSub(node.shadowRoot.children, criteria);
        this._walkSub(node.children, criteria);
      }
    }
  }
  _walkSub(nodes, criteria, slot) {
    for (let n of nodes) {
      this._walkRunner(n, criteria, slot);
    }
  }
}
customElements.define('form-manager', FormManager);
