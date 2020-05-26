/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file is part of football-mobile.

    football-mobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    football-mobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with football-mobile.  If not, see <http://www.gnu.org/licenses/>.
*/


(function() {
  'use strict';

  const chalk = require('chalk');
  const COLOURS = {
    app: chalk.magentaBright,
    db: chalk.greenBright,
    api: chalk.cyanBright,
    log: chalk.yellowBright,
    //error like have backGround colouring
    auth: chalk.black.bgCyan,
    err: chalk.white.bgBlue,
    error: chalk.white.bgRed
  };

  function logger(level, message, client) {
    let logLine = '';
    if (process.env.FOOTBALL_NOLOG === undefined) {
      if (process.env.FOOTBALL_LOGNODATE === undefined) logLine += new Date().toISOString() + ': ';
      if (client) {
        logLine += COLOURS['api'](client + ': ');
      }
      logLine += COLOURS[level](message);
      //eslint-disable-next-line no-console
      console.log(logLine.trim());

    }
  }

  module.exports = logger;
})();
