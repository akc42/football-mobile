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
  const EventEmitter = require('events');
  const path = require('path');
  const debug = require('debug')('ball:pdf');
  const rowData = require('debug')('ball:pdf:rowdata');
  const config = require('../config/config');
  const utils = require('../common/utils');
  const label = require('../config/label');

  const shadeColour = '#fbf0ff';
  const borderColour = '#c8d7e8';
  const tickColour = '#039b03';
  const tablePadding = 2;  //points of padding round text in tables
  const tickBox = 10;
  const addressX = 72;
  const addressY = 155;
  const dateX = 378;
  const dateY = 185;
  const dateW = 150;  //Width of date field
  const footer = process.env.FOOTBALL_FOOTER;
  const info = {
    Author: process.env.FOOTBALL_AUTHOR,
    Subject: process.env.FOOTBALL_SUBJECT
  };

  class PDF extends EventEmitter {
    constructor(manager) {
      super();
      this.db = manager.db;
      this.labelContext = false;
      const self = this;
      manager.on('pdf', async (path, user, params, response, next) => {
        var matches = /^(\w+?)(?:_(letter|portrait|label|logo))?$/.exec(path);
        if (self.listeners(path).length > 0) {
          let doc;
          debug('request to create pdf with name %s',path);
          response.setHeader('Content-Type', 'application/pdf');
          response.setHeader(
            'Link',
            'rel="shortcut icon" sizes="32x32" href="/images/pas-icon-32.png"'
          );
          response.statusCode = 200;
          if (typeof matches[2] !== 'undefined') {
            debug('going Portrait with matches[1] = %s',matches[2]);
            doc = new manager.PDFKit({
              size: 'A4',
              layout: 'portrait',
              info: info,
              margins: {top: 36, bottom: 36, left: 72, right: 72}
            });
            doc.pipe(response);
            doc.font('Helvetica', 11); //default initial font
            switch(matches[2]) {
              case 'letter':
                manager.incCount('pdf-' + path.slice(0,-7));
                this.letter(doc, false);
                debug('Done Letter');
                break;
              case 'logo':
                manager.incCount('pdf-' + path.slice(0,-5));
                this.letter(doc, true);
                debug('Done Letter with Logo');
                break;
              case 'label':
                manager.incCount('pdf-' + path.slice(0,-6));
                break;
              default:
                manager.incCount('pdf-' + path.slice(0,-9));
            }
          } else {
            manager.incCount('pdf-' + path);
            debug('setting up landscape document');
            //In this mode we are going to set 1cm margin as standard
            doc = new manager.PDFKit({
              size: 'A4',
              layout: 'landscape',
              info: info,
              margins: {top: 36, bottom: 36, left: 31, right: 31}});
            doc.pipe(response);
            doc.font('Helvetica', 11); //default initial font
          }
          debug('About to call processing routine');
          //more convenient to split db and manager because not many routines use manager
          this.emit(path, user, params, doc, manager.db, self, manager);
        } else {
          next();
        }

      });
    }
    letter(doc,withLogo,letterDate) {
      doc.font('Helvetica');
      if (withLogo) {
        //not needing to use letter paper
        debug('letter about to output image');
        doc.image(path.resolve(__dirname,'../assets','letter_logo.jpg'),445,13.5,{width: 144});
        this.footer(doc);
      }
      //Format date - use today if not provided
      const ldf = this.longFormatDate(letterDate? letterDate : new Date());
      debug('Long Date Formated is %s',ldf);
      doc.text(ldf,dateX,dateY,{width: dateW, align: 'right'});
      debug('output date text');
      doc.x = addressX;
      doc.y = addressY;
    }
    footer(doc) {
      debug('Make Letter Footer');
      const x = doc.x;
      const y = doc.y;
      const bottom = doc.page.margins.bottom; //save bottom margin
      doc.page.margins.bottom = 0; //clear it so we can write in it
      doc.fontSize(9).fillColor('black').text(
        footer,
        72,810,
        {align: 'center'}
      );
      doc.page.margins.bottom = bottom; //restore it again
      doc.fontSize(11);
      doc.x = x;
      doc.y = y;
    }
    formatAddress(a1,a2,a3,a4,a5) {
      let addressesSpare = 5;
      let doneAddress = false;
      let address = '';
      if (a1 && a1.length > 0) {
        address += a1;
        addressesSpare--;
        doneAddress = true;
      }
      if (a2 && a2.length > 0) {
        if (doneAddress) address += ',\n';
        address += a2;
        addressesSpare--;
        doneAddress = true;
      }
      if (a3 && a3.length > 0) {
        if (doneAddress) address += ',\n';
        address += a3;
        addressesSpare--;
        doneAddress = true;
      }
      if (a4 && a4.length > 0) {
        if (doneAddress) address += ',\n';
        address += a4;
        addressesSpare--;
        doneAddress = true;
      }
      if (a5 && a5.length > 0) {
        if (doneAddress) address += ',\n';
        address += a5;
        addressesSpare--;
      }
      for (let i = 0; i < addressesSpare; i++) {
        address += '\n';
      }
      return address;
    }
    formatDate(aDate) {
      debug('date formatter called with', aDate);
      function pad(s) { return (s < 10) ? '0' + s : s; }
      if (aDate !== null) {
        let d = new Date(aDate);
        return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('/');
      }
      return '';
    }
    longFormatDate(aDate) {
      return utils.longFormatDate(aDate);
    }
    queryTableHeading(doc, query) {
      /*
        get together some key parameters about our table
      */
      doc.fontSize(10).font('Helvetica');
      let rowHeight = doc.currentLineHeight(false) + 2 * (tablePadding + 1);
      let rowWidth = query.sizes.reduce((a,b) => a + b, 0) +
        (query.head.length * (2 * tablePadding + 1)) + 1  ;
      let initialX = doc.x;
      let initialY = doc.y;
      debug('queryTable InitialXY %d,%d rowSize %d,%d',initialX,initialY,rowWidth,rowHeight);
      /*
        We need to construct the background to the table header before we add the text
        We do the bounding rectangel first, followed by the column dividers
      */
      let startX = initialX;
      doc.rect(initialX,initialY,rowWidth,rowHeight).lineWidth(1).lineJoin('miter')
        .fillAndStroke(shadeColour,borderColour);
      for (let i = 0; i < query.head.length - 1; i++) {
        startX += (query.sizes[i] + 1 + 2 * tablePadding);
        rowData('queryTable heading column divider %d,%d',startX,initialY);
        doc.moveTo(startX,initialY)
          .lineWidth(1).lineCap('square')
          .lineTo(startX,initialY + rowHeight)
          .stroke(borderColour);
      }
      /*
        Now we can write out the heading
      */
      doc.fillColor('black');
      startX = initialX + 1 + tablePadding;
      for (let i = 0; i < query.head.length; i++) {
        doc.text(
          query.head[i],
          startX,
          initialY + tablePadding + 1,
          {align: 'center', width: query.sizes[i]});
        startX += (query.sizes[i] + 1 + 2 * tablePadding);
      }
      doc.x = initialX;
      doc.y = initialY + rowHeight;
      debug('queryTable heading done');

    }
    async queryTable(doc, name, params, rowHook) {
      let self = this;
      // if name is a string its a reference to a wquery, otherwise its the queury itself
      let query = typeof name === 'string' ? config[name] : name;
      if (query) {
        doc.info.Title = doc.info.Title || query.name; //use first query name if not already set
        if (query.head.length !== query.sizes.length) {
          throw new Error('Sizes and Head mismatch in config query ' + query.name);
        }
        debug('About to Process Query %s', name);

        this.queryTableHeading(doc,query);

        /*
          We are going to write subsequent rows, so the top line overwrites the bottom
          line of the row above it (in this case the heading).  We therefore take 1
          from the row height to get us to the correct place
        */
        let rowHeight = doc.currentLineHeight(false) + 2 * (tablePadding + 1);
        await this.db.exec(async connection => {
          let request = connection.request(query.sql);
          if (query.date) {
            request.addParameter(
              'startdate',
              self.db.TYPES.DateTime,
              utils.urlDayToDate(params.startdate, -3));
            request.addParameter(
              'enddate',
              self.db.TYPES.DateTime,
              utils.urlDayToDate(params.enddate, 3));
          }
          if (query.id) {
            request.addParameter('id',self.db.TYPES.Int,params.id);
          }
          if (query.sp) {
            debug('stored procedure being called');
            await connection.callProcedure(async getRow => {
              let row = await getRow();
              let even = false;
              while (row) {
                rowData('query got row');
                if (rowHook) { //allow us to do other things with the fields.
                  debug('about to call row hook');
                  row = rowHook(row,query);
                }
                /*
                  The yield statement calls processRow first, returning its result
                  (which should be false - not blocked) to the db exec iterator, which
                  then yields us the next row
                */
                row = await getRow(self.processRow(doc,row,query.sizes,rowHeight,even));
                even = even ? false : true;
              }
            });
          } else {
            debug('sql being used');
            await connection.execSql(async getRow => {
              let row = await getRow();
              let even = false;
              while (row) {
                debug('query got row');
                if (rowHook) { //allow us to do other things with the fields.
                  debug('about to call row hook');
                  row = rowHook(row,query);
                }
                /*
                  The yield statement calls processRow first, returning its result
                  (which should be false - not blocked) to the db exec iterator, which
                  then yields us the next row
                */
                row = await getRow(self.processRow(doc,row,query.sizes,rowHeight,even));
                even = even ? false : true;
              }
            });
          }
        });
      } else {
        debug('Unknown Query %s',name);
        throw new Error('Unknown Query');
      }
    }
    processRow(doc, row, sizes, rowHeight, shade, options) {
      let rowOptions =  Object.assign(
        {},
        {tablePadding: tablePadding, shadeColour: shadeColour, borderColour: borderColour, 
          tickBox: tickBox, tickColour: tickColour},
        (options || {})
      ); //merge existing defaults with optional different options from call


      rowData('Process Row: length = %d', row.length);
      let rowWidth = sizes.reduce((a,b) => a + b, 0) +
        (sizes.length * (2 * rowOptions.tablePadding + 1)) + 1  ;
      if (row.length !== sizes.length) {
        throw new Error('Number of Fields do not match the Sizes array');
      }
      let initialX = doc.x;
      let initialY = doc.y;
      rowData('processRow initialXY %d,%d', initialX, initialY);
      let startX = initialX;
      doc.rect(initialX,initialY,rowWidth,rowHeight).lineWidth(1).lineJoin('miter');
      if (shade) {
        doc.fillAndStroke(rowOptions.shadeColour,rowOptions.borderColour);
      } else {
        doc.stroke(rowOptions.borderColour);
      }
      for (let i = 0; i < row.length - 1; i++) {
        startX += sizes[i] + 1 + 2 * rowOptions.tablePadding;
        doc.moveTo(startX,initialY)
          .lineWidth(1).lineCap('square')
          .lineTo(startX,initialY + rowHeight)
          .stroke(rowOptions.borderColour);
      }
      /*
        Now Process the data from the row
      */
      doc.fillColor('black');
      startX = initialX + 1 + rowOptions.tablePadding;
      initialY += rowOptions.tablePadding + 1; //Now we've done boarder text is going to start lower
      for (let i = 0; i < row.length; i++) {
        rowData('processing field %d', i);
        let v = row[i].value;
        if (v !== null) {
          /*eslint-disable no-case-declarations*/
          switch (row[i].metadata.type.name) {
            case 'DateTimeN':
              doc.text(
                //If date before then, must be a time
                v > new Date(1900,1) ? this.formatDate(v) : ('0' +
                  v.getHours()).slice(-2) + ':' +
                  ('0' + v.getMinutes()).slice(-2),
                startX,
                initialY,
                {align: 'center', width: sizes[i], height: rowHeight}
              );
              break;
            case 'MoneyN':
              let mString;
              // We have to round the figure to two decimal places
              if (v < 0) {
                mString = '-£(' + (-v).toFixed(2) + ')';
                doc.fillColor('red');
              } else {
                mString = '£' + v.toFixed(2);
              }
              doc.text(
                mString,
                startX,
                initialY,
                {align: 'right', width: sizes[i], height: rowHeight}
              );
              if (v < 0) {
                doc.fillColor('black');
              }
              break;
            case 'Bit':
              const X = startX + sizes[i]/2 - rowOptions.tickBox/2;
              const Y = initialY + rowHeight/2 - rowOptions.tickBox/2;
              doc.rect(X,Y,rowOptions.tickBox,rowOptions.tickBox).lineWidth(1).lineJoin('miter').stroke();
              if (v) {
                doc.moveTo(X + rowOptions.tablePadding,Y + rowOptions.tickBox/2)
                  .lineWidth(1).lineCap('round')
                  .lineTo(X + rowOptions.tickBox/2, Y + rowOptions.tickBox - rowOptions.tablePadding)
                  .lineTo(X + 1.5 * rowOptions.tickBox, Y + rowOptions.tablePadding)
                  .stroke(rowOptions.tickColour);
                doc.fillColor('black');
              }
              break;
            default:
              doc.text(
                v,
                startX,
                initialY,
                {align: 'left', width: sizes[i], height: rowHeight, ellipsis: true}
              );
          }
          /*eslint-enable no-case-declarations*/
        }
        startX += (sizes[i] + 1 + 2 * tablePadding);
      }
      doc.x = initialX;
      doc.y = initialY + rowHeight - 1 - tablePadding;
      return Promise.resolve(); //Not blocked
    }
    tableHeader(doc,heading,sizes) {
      let initialX = doc.x;
      let initialY = doc.y;
      let startX = initialX;
      doc.fontSize(10);
      for (let j = 0; j < sizes.length; j++) {
        let h = heading[j];
        let s = sizes[j];
        doc.text(h, startX, initialY, {align: 'center', width: s + 4}); //allow for table padding
        startX += s + 5;
      }
      doc.moveTo(initialX,initialY + 15).lineWidth(2).lineCap('round')
        .lineTo(startX ,initialY + 15).stroke();
      doc.lineWidth(1).fontSize(8).moveDown(2);
      doc.x = initialX;
      debug('After header doc.y = ', doc.y);
    }
    label(doc,type,position) {
      debug('label of type ', type, ' at position ', position);
      let params = label[type];
      if (params === undefined) {
        throw new Error('Invalid Label Type');
      }
      if (this.labelDepth) {
        throw new Error('Label Context not clear');
      }
      this.labelDepth = true;
      let inPage = position % (params.rows * params.columns);
      if (position > 0 && inPage === 0) {
        doc.addPage();
      }
      let column = inPage % params.columns;
      let row = Math.floor(inPage / params.columns);
      debug('Label column ', column, ' row ', row);
      doc.save();  // save context so we can restore it
      //eslint-disable-next-line max-len
      debug('about to translate to ', params.initialX + ( column * params.deltaX),',',params.initialY + (row * params.deltaY));
      doc.translate(params.initialX + ( column * params.deltaX), params.initialY + (row * params.deltaY));
      return position + 1;
    }
    labelContextReset(doc) {
      if (!this.labelDepth) {
        throw new Error('Label Context Not Set');
      }
      doc.restore();
      this.labelDepth = false;
    }
    list(doc,list) {
      const initialX = doc.x;
      const textW = 431;
      for(let item of list) {
        const initialY = doc.y;
        //now output the text indented
        debug('output text at ', initialX + 20, ',', initialY, ' with width ', textW);
        doc.text(item, initialX + 20, initialY, {width: textW, align: 'justify'});
        const finalY = doc.y;
        //draw a bullet
        doc.circle(initialX +1.5, initialY +1.5, 1.5).fillAndStroke();
        doc.y = finalY;
      }
      doc.x = initialX;
    }

  }

  module.exports = PDF;
})();
