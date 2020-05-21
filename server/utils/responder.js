/*
  Copyright (c) 2016 Alan Chandler, all rights reserved

  This file is part of PASv5, an implementation of the Patient Administration
  System used to support Accuvision's Laser Eye Clinics.*

  PASv5 is licenced to Accuvision (and its successors in interest) free of royality payments
  and in perpetuity in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
  implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. Accuvision
  may modify, or employ an outside party to modify, any of the software provided that
  this modified software is only used as part of Accuvision's internal business processes.

  The software may be run on either Accuvision's own computers or on external computing
  facilities provided by a third party, provided that the software remains soley for use
  by Accuvision (or by potential or existing customers in interacting with Accuvision).
*/

(function() {
  'use strict';

  const debug = require('debug')('football:responder');
  const rowData = require('debug')('football:responder:rowdata');

  class Responder {
    constructor(response) {
      debug('Starting responder');
      this.response = response;
      this.doneFirstRow = false;
      this.doneFirstSection = false;
      this.ended = false;
      this.isArray = false;
      this.awaitingDrain = false;
    }
    addSection(name, value) {
      if (!this.ended) {
        if (this.isArray) {
          throw new Error('Cannot add section to an array');
        }
        if (this.doneFirstSection) {
          //need to close previous one
          if (this.inSection) {
            this.response.write(']');
          }
          this.response.write(',"' + name + '": ');
        } else {
          this.response.write('{"' + name + '": ');
        }

        if (value !== undefined) {
          this.response.write(JSON.stringify(value));
          this.inSection = false;
          debug('Value section %s',name);
        } else {
          this.response.write('[');
          this.inSection = true;
          debug('In section %s',name);
        }
        this.doneFirstSection = true;
        this.doneFirstRow = false;
      }
    }
    write(row) {
      if (!this.ended) {
        if (!this.doneFirstSection) {
          this.isArray = true;
          this.response.write('[');
          this.doneFirstSection = true;
          this.inSection = true;
        }
        if (!this.inSection) {
          throw new Error('Cannot add rows after a value section without a new section header');
        }
        if (this.doneFirstRow) {
          this.response.write(',');
        }
        this.doneFirstRow = true;
        const JSONrow = JSON.stringify(row);
        const reply = this.response.write(JSONrow);
        rowData(`Write with reply ${reply} written response ${JSONrow}`);
        if (reply) {
          return Promise.resolve();
        }
        debug('False reply from write so need return the promise of a drain');
        if (!this.awaitingDrain) {
          this.awaitingDrain = true;
          const self = this;
          debug('create a drain promise as we do not have one');
          this.drainPromise = new Promise(resolve => {
            self.response.once('drain', () => {
              self.awaitingDrain = false;
              debug('drained so resolve promise of drain');
              resolve();
            });
          });
        }
        return this.drainPromise;
      }
      return Promise.reject(); //mark as blocked
    }
    end() {
      debug('End Responder');
      if (!this.ended) {
        if (this.inSection) {
          this.response.write(']');
        }
        if (!this.isArray) {
          if (this.doneFirstSection) {
            this.response.end('}');
          } else {
            this.response.end('[]');
          }
        } else {
          this.response.end();
        }
      }
      this.ended = true;
    }
  }
  module.exports = Responder;
})();
