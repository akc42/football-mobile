/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file is part of Football-Mobile.

    Football-Mobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Football-Mobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Football-Mobile.  If not, see <http://www.gnu.org/licenses/>.
*/
(() => {
  const debug = require('debug')('football:version');
  const fs = require('fs').promises;
  const path = require('path');
  const child = require('child_process');
  const root = path.resolve(__dirname, '../..');

  function shCmd(cmd) {
    debug('About to execute Command ', cmd);
    return new Promise((resolve, reject) => {
      child.exec(cmd, { cwd: root }, (err, stdout, stderr) => {
        if (stderr) {
          debug('Command ', cmd, 'about to fail with ', err);
          reject(err);
        } else {
          const out = stdout.trim();
          debug ('Command ', cmd, 'Success with ', out);
          resolve(out);
        }
      });
    });
  }

  const releaseVersion = new Promise(async (resolve, reject) => {
    try {
      debug('Look for git')
      await fs.access(path.resolve(root, '.git'));
      debug('Git found, so use it to get data')
      //we get here if there is a git directory, so we can look up version and latest commit from them
      const version = await shCmd('git describe --abbrev=0 --tags');
      const mtime = await shCmd('git log -1 --format=%cd');
      const copyrightTime = new Date(mtime);
      debug('Resolving with Git copyright Year is ', copyrightTime.getUTCFullYear());
      resolve({ version: version, year: copyrightTime.getUTCFullYear() });
    } catch (e) {
      //no git, so we must look for a version file
      try {
        debug('Git approach failed, so look for release info');
        const version = await fs.readFile(path.resolve(root, 'release.info'), 'utf8');
        const { mtime } = await fs.stat(path.resolve(root, 'release.info'));
        const copyrightTime = new Date(mtime);
        debug('Resolving with file as version ', version, ' and time as ', mtime);
        resolve({ version: version, year: copyrightTime.getUTCFullYear() });
      } catch (err) {
        reject(err);
      }
    }
  });
  module.exports = releaseVersion;

})();
