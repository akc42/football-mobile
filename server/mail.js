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


  const WORDWRAP = parseInt(process.env.FOOTBALL_MAIL_WORDWRAP || 130,10) ;


  const path = require('path');
  const htmlToText = require('html-to-text');
  const logger = require('../common/logger');
  const header1 = `<!DOCTYPE html><html style="font-size: 100%; overflow-y:scroll;-webkit-text-size-adjust:100%;
  -ms-text-size-adjust:100%;"><head style><meta charset="utf-8"><title>`;
  const header2 = '</title><link rel="dns-prefetch" href="//football.melindasbackups.com"><meta name="description" content="';
  const header3 = `"><meta name="author" content="Football Administration"></head>
    <body style="background-color:#FFFFFF;margin:0;font-size:11pt;line-height:1.231;font-family:sans-serif;color:#222;">
    <div style="width:620px;margin:auto;background-color:#FFF;padding:5px 30px;border solid 2px black">`;
  const footer = `<p><b>Football Administration</b></p></body></html>`;
  //eslint-disable-next-line max-len,no-useless-escape
  const emailRegex = /^(,?\s*\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)+$/i;

  const debug = require('debug')('pas:mailer');
  const PassThrough = require('stream').PassThrough;
  class Tunnel extends PassThrough {
    constructor() {
      super();
    }
    setHeader() {
      //no op
    }
  }
  const EventEmitter = require('events');

  class Mailer {
    constructor(transport, user, params, manager) {
      debug('Constructing a Mailer to %s', params.to);
      this.transport = transport;
      this.user = user;
      this.db = manager.db;
      this.manager = manager;
      this.maildata = {
        from: process.env.PAS_MAIL_FROM,
        attachments: []
      };
      if (params.to !== undefined && this.validateEmail(params.to)) {
        this.maildata.to = params.to;
      }
      if (params.cc !== undefined && this.validateEmail(params.cc)) {
        this.maildata.cc = params.cc;
      }
      if (params.bcc !== undefined && this.validateEmail(params.bcc)) {
        this.maildata.bcc = params.bcc;
      }
      this.params = params;
    }
    attachPdf(name) {
      const tunnel = new Tunnel();
      debug('pdf attachment %s.pdf added', name);
      this.maildata.attachments.push({
        filename: name + '.pdf',
        content: tunnel
      });
      this.manager.emit('pdf',name,this.user,this.params, tunnel, () => {
        throw new Error('requested pdf "' + name + '" not processed');
      });
    }
    attachFile(filename) {
      debug('filename attachment %s added',filename);
      this.maildata.attachments.push({
        path: path.resolve(__dirname,'../assets',filename)
      });

    }
    setTextBody(text) {
      debug('set text body');
      this.maildata.text = text;
    }
    setHtmlBody(html, tables) {
      debug('set html body');
      this.maildata.html = html;
      if (!this.maildata.text) {
        //user has not already added a text segment so we make one from the html
        this.maildata.text = htmlToText.fromString(html, {
          wordwrap: WORDWRAP,
          tables: tables
        });

      }
    }
    send(subject, to, cc, bcc, logObj) {
      this.maildata.subject = subject;
      debug('starting send');
      return new Promise((accept,reject) => {
        if (to && this.validateEmail(to)) {
          debug('added "to" of %s to send',to);
          this.maildata.to = to;
        }
        if (cc && this.validateEmail(cc)) {
          debug('added "cc" of %s to send',cc);
          this.maildata.cc = cc;
        }
        if (bcc && this.validateEmail(bcc)) {
          debug('added "bcc" of %s to send',bcc);
          this.maildata.bcc = bcc;
        }
        debug('is to already set up?');
        if (this.maildata.to === undefined) {
          reject(new Error('Cannot send mail without to address'));
        } else if (!this.maildata.text)  {
          reject(new Error('Attempt to send mail before setting body'));
        } else {
          let missingData = true;
          if (logObj) {
            if (logObj.type === undefined) {
              reject(new Error('LogObj "type" field missing'));
            } else if (logObj.pid === undefined) {
              reject(new Error('LogObj "pid" field missing'));
            } else if (logObj.extra === undefined) {
              reject(new Error('LogObj "extra" field missing'));
            } else {
              logObj.to = this.maildata.to;
              missingData = false;
            }
          } else {
            missingData = false;
          }
          if (!missingData) {
            debug('about to send over transport');
            this.transport.sendMail(this.maildata, (err,info) => {
              debug('transport send happened (or not)');
              if (err) {
                debug('transport send errored');
                reject(err);
              } else {
                debug('Sent mail with messageId %s', info.messageId);
                logger(
                  'mail',
                  `Mail with Subject ${subject} sent successfully to ${this.maildata.to}`
                );
                if (logObj) logObj.extra += ` with message id ${info.messageId}`;
                accept('send');
              }
            });
          }
        }
      });
    }
    validateEmail(email) {
      if (email) return emailRegex.test(email);
      return false;
    }
    getHtmlHeader(title) {
      debug('Return Header');
      return header1 + title + header2 + title + header3;
    }
    getHtmlFooter() {
      debug('Return Footer');
      return footer;
    }

  }

  class MAIL extends EventEmitter {
    constructor(manager) {
      super();
      this.manager = manager; //save so we can use it to request pdf stream
      this.db = manager.db;
      this.isClosed = false;
      const transport = process.env.FOOTBALL_MAIL === 'Yes' ? manager.nodemailer.createTransport({
        port: 25,
        host: 'localhost',
        secure: false,
        ignoreTLS: true
      }) : {
        verify: callback => {
          logger('app', 'Simulating Mail Verify');
          Promise.resolve().then(callback());
        },
        sendMail: (mail, callback) => {
          logger('app', 'Simulating Mail Send');
          Promise.resolve().then(callback(null,{messageId:'Simulated Id'}));
        }
      };
      const transportPromise = new Promise((accept, reject) => {
        transport.verify((error) => {
          if (error) {
            logger('error','Transport Verification Failed ' + error.toString());
            reject(error);
          } else {
            debug('Mail Transport Verified');
            accept();
          }
        });
      });
      manager.on('mail', async (path, user, params, response, next) => {
        debug('mailer called with path %s',path);
        if (this.listeners(path).length > 0) {
          try {
            response.setHeader('Content-Type','application/json');
            await transportPromise;
            const mailer = new Mailer(transport, user, params, manager);
            manager.incCount('mail-' + path);
            response.statusCode = 200;
            this.emit(path, mailer, response);
          } catch (err) {
            logger('error', `/api/mail/${path} failed with ${err.toString()}`);
            response.statusCode = 400;
            response.end();
          }
        } else {
          next();
        }
      });
    }
  }

  module.exports = MAIL;
})();
