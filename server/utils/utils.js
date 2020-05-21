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

  const debug = require('debug')('pas:utils');
  const rowData = require('debug')('pas:utils:rowdata');


  function daysInFebruary(year) {
    /* February has 29 days in any year evenly divisible by four,
       EXCEPT for centurial years which are not also divisible by 400. */
    return (((year % 4 == 0) && ((!(year % 100 == 0)) || (year % 400 == 0))) ? 29 : 28);
  }

  function daysInMonth(month, year) {
    let m = 31;
    if (month === 4 || month === 6 || month === 9 || month === 11) {m = 30;}
    if (month  === 2) {m = daysInFebruary(year);}
    return m;
  }

  function ymdToDate(d, m, y, backward) {
    let day = parseInt(d);
    let month = parseInt(m);
    let year = parseInt(y);
    if (year < 1900 || year > 2050) {return false;}
    if (month < 1 || month > 12) {return false;}
    if (day < 1 || day > daysInMonth(month,year)) {return false;}
    return new Date(year, month - 1, day, backward || 0 , 0, 0);
  }

  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const days = [
    'Sun',
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat'
  ];

  function ordinalise(day) {
    if (day > 10 && day < 20) {
      return day.toString() + 'th';
    }
    switch (day % 10) {
      case 1:
        return day.toString() + 'st';
      case 2:
        return day.toString() + 'nd';
      case 3:
        return day.toString() + 'rd';
      default:
        return day.toString() + 'th';
    }
  }

  function dateToSqlDay(day, month, year) {
    return ('000' + year.toString()).slice(-4) + ('0' + month.toString()).slice(-2) +
      ('0' + day.toString()).slice(-2);
  }

  function strToDateMatches(dateStr) {
    var matches;
    //eslint-disable-next-line max-len
    if ((matches = /^(?:(?:([0-3]?\d)\/([0,1]?\d))|(?:([0,1]?\d)\/)?((?:19|20)\d{2})|(?:([0-3]?\d)\/?([0,1]?\d)\/?((?:19|20)\d{2})))$/.exec(dateStr))) {
      return matches;
    } else {
      return false;
    }
  }

  module.exports = {
    normaliseField: function(field, urlFormat) {
      let v = field.value;
      if (v !== null) {
        switch (field.metadata.type.name) {
          case 'DateTimeN':
          case 'DateTime':
            return this.dateToStr(v,urlFormat);
          case 'MoneyN':
            return v.toFixed(2); //round to two decimal places
          case 'Binary':
          case 'VarBinary':
            return this.buffToHex(v);
          default:
            return v;
        }
      } else {
        return '';
      }
    },
    rowToObject: function(row, urlFormat) {
      let fields = {};
      for (let i = 0; i < row.length; i++) {
        let n = row[i].metadata.colName.toLowerCase();
        let fv = this.normaliseField(row[i],urlFormat);
        if (fields[n]) {
          //field already exists in out output, I don't want to allow this so throw
          throw new Error('Cannot support queries where two fields are the same name');
        }
        fields[n] = fv;
      }
      return fields;
    },

    urlDayToDate: function(urlDay, backward) {
      var matches;
      // eslint-disable-next-line no-cond-assign
      if (matches = /^(\d{4})(\d{2})(\d{2})$/.exec(urlDay)) {
        return ymdToDate(matches[3], matches[2], matches[1], backward);
      }
      return false;
    },
    dateToStr: function(aDate, urlFormat) {
      if (aDate > new Date(1900,1)) {
        let day = ('00' + aDate.getDate().toString()).slice(-2);
        let month =  ('00' + (aDate.getMonth() + 1).toString()).slice(-2);
        let year = ('000' + aDate.getFullYear().toString()).slice(-4);
        if (urlFormat) {
          return year + month + day;
        }
        return day + '/' + month + '/' + year;
      } else {
        if (aDate.getTime() === -2208988800000) return '';
        return ('0' + aDate.getHours()).slice(-2) + ':' + ('0' + aDate.getMinutes()).slice(-2);
      }
    },
    strToSqlDay: function(dateStr) {
      /* jshint boss: true */
      let matches;
      let year;
      let month;
      let day;
      if ((matches = strToDateMatches(dateStr))) {
        if (matches[1] !== undefined && matches[2] !== undefined) {
          debug('Exact This year');
          //this is dd/mm
          year = new Date().getFullYear();
          month = parseInt(matches[2],10);
          day = Math.min(parseInt(matches[1],10),daysInMonth(month,year));
          return dateToSqlDay(day,month,year);
        } else if (matches[4] !== undefined) {
          //this is either mm/yyyy or yyyy
          if (matches[3] !== undefined) {
            debug('Vague within Month this year');
            return dateToSqlDay(1,matches[3],matches[4]);
          } else {
            debug('Vague for Year');
            return dateToSqlDay(1,1,matches[4]);
          }
        } else {
          debug('Exact');
          return dateToSqlDay(matches[5],matches[6],matches[7]);
        }
      } else {
        throw new Error('Invalid Date');
      }

    },
    strToDateDiff: function(fieldStr, dateStr, vague) {
      /* jshint boss: true */
      let matches;
      let year;
      let month;
      let day;
      if ((matches = strToDateMatches(dateStr))) {
        if (matches[1] !== undefined && matches[2] !== undefined) {
          debug('Exact This year');
          //this is dd/mm
          year = new Date().getFullYear();
          month = parseInt(matches[2],10);
          day = Math.min(parseInt(matches[1],10),daysInMonth(month,year));
          return `DATEDIFF(d,${fieldStr},'${dateToSqlDay(day,month,year)}') = 0`;
        } else if (matches[4] !== undefined) {
          //this is either mm/yyyy or yyyy
          if (matches[3] !== undefined) {
            debug('Vague within Month within a year');
            //vague search within specified month this year
            return `DATEDIFF(${vague ? 'm' : 'd'},${fieldStr},'${dateToSqlDay(1,matches[3],matches[4])}') = 0`;
          } else {
            debug('Vague for Year');
            //this is a special search for anydate within a year
            return `DATEDIFF(${vague ? 'yy' : 'd'},${fieldStr},'${dateToSqlDay(1,1,matches[4])}') = 0`;
          }
        } else {
          debug('Exact');
          // we have an exact date so
          return `DATEDIFF(d,${fieldStr},'${dateToSqlDay(matches[5],matches[6],matches[7])}') = 0`;
        }
      } else {
        throw new Error('Invalid Date');
      }
    },
    strToSqlTime: function(time) {
      var ix = time.indexOf(':');
      if (ix < 0) {throw new Error('Missing ":" in Time Parameter');}
      let hr = parseInt(time.substring(0, ix), 10);
      let mn = parseInt(time.substring(ix + 1), 10);
      if (hr < 0 || hr > 23 || mn < 0 || mn > 59) {
        throw new Error('Invalid "Time" in parameters');
      }
      return new Date(1899,11,30,hr,mn);

    },
    longFormatDate(aDate) {
      let d = new Date(aDate);
      return [
        ordinalise(d.getDate()),
        months[d.getMonth()],
        d.getFullYear()
      ].join(' ');
    },
    isAuthorised(user, keys) {
      if (user.keys.indexOf('A') >= 0) {return true;}  //Superuser has everything
      return keys.split(':').some(key => {
        if (key.length > 0) {
          return user.keys.split(':').some(ukey => {
            if (ukey.length > 0 && ukey === key) {
              return true;
            } else {
              return false;
            }
          });
        } else {
          return false;
        }
      });

    },
    urlDayToSqlMidnight(day) {
      var matches;
      // eslint-disable-next-line no-cond-assign
      if (matches = /^(\d{4})(\d{2})(\d{2})$/.exec(day)) {
        return new Date(Date.UTC(matches[1] ,matches[2] -1, matches[3],0,0,0,0));
      }
      throw new Error('Invalid URL Day');
    },
    hexToBuff(hex) {
      return Buffer.from(hex,'hex');
    },
    buffToHex(buf) {
      return buf.toString('hex');
    },
    months: months,
    days: days
  };
})();
