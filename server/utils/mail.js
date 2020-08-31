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
/*
  Icons made by < a href = "https://www.flaticon.com/authors/freepik" title = "Freepik" > Freepik</a > from < a href = "https://www.flaticon.com/" title = "Flaticon" > www.flaticon.com</a >
*/
(function() {
  'use strict';
  const path = require('path');
  const nodemailer = require('nodemailer');
  const htmlToText = require('html-to-text');
  const logger = require('./logger');
  const cyrb53 = require('./cyrb53');

  const db = require('./database');

  const header1 = `<!DOCTYPE html><html style="font-size: 100%; overflow-y:scroll;-webkit-text-size-adjust:100%;
  -ms-text-size-adjust:100%;"><head style><meta charset="utf-8"><title>`;
  const header3 = `"><meta name="author" content="Football Administration"></head>
    <body style="background-color:#FFFFFF;margin:0;font-size:11pt;line-height:1.231;font-family:sans-serif;color:#222;">
    <div style="width:620px;margin:auto;background-color:#FFF;padding:5px 30px;border solid 2px black">`;
  
  //eslint-disable-next-line max-len,no-useless-escape
  const emailRegex = /^(,?\s*\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b)+$/i;

  const debug = require('debug')('football:mailer');
  const PassThrough = require('stream').PassThrough;
  class Tunnel extends PassThrough {
    constructor() {
      super();
    }
    setHeader() {
      //no op
    }
  }


  const transportReady = new Promise((accept, reject) => {
    const transport = nodemailer.createTransport({
      port: 25,
      host: 'localhost',
      secure: false,
      ignoreTLS: true
    });
    transport.verify((error) => {
      if (error) {
        logger('error', 'Transport Verification Failed ' + error.toString());
        reject(error);
      } else {
        debug('Mail Transport Verified');
        accept(transport);
      }
    });
  });

  function validateEmail(email) {
    debug('validating ', email);
    if (email) return emailRegex.test(email);
    return false;
  }

  const createMailer = function () {
    debug('Constructing a Mailer');
    let mailFooter;
    let mailWordwrap;
    let siteLogo;
    let mailSignature;
    let mailFrom;
    
    const s = db.prepare('SELECT value FROM settings WHERE name = ?').pluck();
    db.transaction(() =>{
      mailFooter = s.get('mail_footer');
      mailWordwrap = s.get('mail_wordwrap');
      siteLogo = s.get('site_logo');
      mailSignature = s.get('mail_signature');
      mailFrom = s.get('email_from');
    })();


    function resetMaildata() {
      return { attachments: [], from: mailFrom };
    }

    
    const footer = `<p></p><div style="font-size: 100%;">${mailFooter}</div></div></body></html>`;
    let maildata = resetMaildata();
    let sendInProgress = false;
    let images = 0;

    return {
      attachPdf: function (name) {
        if (sendInProgress) throw Error('Send In Progress');
        const tunnel = new Tunnel();
        debug('pdf attachment %s.pdf added', name);
        maildata.attachments.push({
          filename: name + '.pdf',
          content: tunnel
        });

      },
      attachFile: function (filename) {
        if (sendInProgress) throw Error('Send In Progress');
        debug('filename attachment %s added', filename);
        maildata.attachments.push({
          path: path.resolve(__dirname, '../attach', filename)
        });

      },
      getImageHtml: function (filename, alttext) {
        if (sendInProgress) throw Error('Send In Progress');
        images++;
        const cid = `image${images}`; 
        maildata.attachments.push({
          path: path.resolve(__dirname, '../../client', filename),
          cid: cid
        });
        return `<img src="cid:${cid}" alt="${alttext ? alttext : filename}"/>`;
      },
      setTextBody: function (text) {
        if (sendInProgress) throw Error('Send In Progress');
        debug('set text body');
        maildata.text = text;
      },
      setHtmlBody: function (mailSiteUrl,title, html, tables) {
        if (sendInProgress) throw Error('Send In Progress');
        debug('set html body');
        const header2 = `</title><link rel="dns-prefetch" href="${mailSiteUrl}"><meta name="description" content="`;
        const headerImg = this.getImageHtml(siteLogo.substring(1), 'Site Logo Image');
        let signature = '<p>';
        if (mailSignature.charAt(0) === '/') {
          //we have an image, but do we have a caption
          const captionPosition = mailSignature.indexOf(';') + 1;
          let alttext = 'Signature';
          let additionalHtml = '';
          let sigImage;
          if (captionPosition >0) {
            sigImage = mailSignature.substring(1,captionPosition - 1);
            alttext = mailSignature.substring(captionPosition);
            additionalHtml = `<br><span style="font-size:80%">${alttext}</span>`
          } else {
            sigImage = mailSignature.substring(1);
          }
          signature += this.getImageHtml(sigImage, alttext) + additionalHtml;
        } else {
          signature += mailSignature;
        }
        signature += '</p>';
        maildata.html = header1 + title + header2 + title + header3 + headerImg + html + signature + footer;
        if (!maildata.text) {
          //user has not already added a text segment so we make one from the html
          maildata.text = htmlToText.fromString(maildata.html, {
            wordwrap: mailWordwrap,
            tables: tables,
            linkHrefBaseUrl: mailSiteUrl,
            hideLinkHrefIfSameAsText: true
          });

        }
      },
      send: async function (subject, to, cc, bcc) {
        if (sendInProgress) throw Error('Send In Progress');
        if (!maildata.text) throw new Error('Attempt to send mail before setting body');
        maildata.subject = subject;
        debug('starting send');
        if (to && validateEmail(to)) {
          if (process.env.FOOTBALL_ENABLE_EMAIL === 'yes') {
            debug('added "to" of %s to send', to);
            maildata.to = to;
          } else {
            maildata.to = process.env.FOOTBALL_ENABLE_EMAIL;
          }
        } else {
          throw new Error('Cannot send mail without a "to" address');
        }
        if (cc && validateEmail(cc)) {
          if (process.env.FOOTBALL_ENABLE_EMAIL === 'yes') {
            debug('added "cc" of %s to send', cc);
            maildata.cc = cc;
          } else {
            maildata.cc = process.env.FOOTBALL_ENABLE_EMAIL;
          }
        }
        if (bcc && validateEmail(bcc)) {
          if (process.env.FOOTBALL_ENABLE_EMAIL === 'yes') {
            debug('added "bcc" of %s to send', bcc);
            maildata.bcc = bcc;
          } else {
            maildata.bcc = process.env.FOOTBALL_ENABLE_EMAIL;
          }
        }
        debug('about to send over transport');
        sendInProgress = true;
        const transport = await transportReady;
        const info = await transport.sendMail(maildata)
        sendInProgress = false;
        logger('mail', `Mail with Subject ${maildata.subject} sent successfully to ${maildata.to} with messageId ${info.messageId}`);
        maildata = resetMaildata();;
      }
    };
  };

  module.exports = createMailer;
  
})();
