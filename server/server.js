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
  const debug = require('debug')('football:server');
  const debugdb = require('debug')('football:db');
  const debugapi = require('debug')('football:api');
  const path = require('path');
  require('dotenv').config({path: path.resolve(__dirname,'.env')});
  const fs = require('fs').promises;
  const sqlite3 = require('sqlite3');
  const { open } = require('sqlite');
  const includeAll = require('include-all');
  const bodyParser = require('body-parser');
  const Router = require('router');
  const jwt = require('jwt-simple');
  const http = require('http');
  const serverDestroy = require('server-destroy');
  const finalhandler = require('finalhandler');

  const logger = require('./utils/logger');
  const Responder = require('./utils/responder');
  const versionPromise = require('./version');

  function dbOpen() {
    debugdb('Open Database Called');
    return open({
      filename: path.resolve(__dirname, '../data', process.env.FOOTBALL_DB),
      mode: sqlite3.OPEN_READWRITE,
      driver: sqlite3.Database
    }).then(db => {
      db.exec('PRAGMA foreign_keys = ON;')
      return db;
    });
  }  
  
  function loadServers(webdir, relPath) {
    return includeAll({
      dirname: path.resolve(webdir, relPath),
      filter: /(.+)\.js$/
    }) || {};
  }
  function forbidden(req,res, message) {
    debug('In "forbidden"');
    logger('auth', `${message} with request url of ${req.originalUrl}`, req.headers['x-forwarded-for']);
    res.setHeader('Set-Cookie', 'MBBALL=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/');
    res.statusCode = 403;
    res.end();
  }

  function finalErr (err, res, req) {
    logger('error', `Final Error at url ${req.originalUrl} with error ${err.stack}`);
  }

  function generateCookie(uid, cid) {
    const date = new Date();
    date.setTime(date.getTime() + (ParseInt(process.env.FOOTBALL_COOKIE_LENGTH,10) * 24 * 60 * 60 * 1000));
    const payload = {
      exp: Math.round(date.getTime()/1000),
      uid: uid,
      cid, cid
    };
    debug('generated cookie for uid ', uid, ' cid ', cid ,' expires ', date.toGMTString());
    return `MBBALL=${jwt.encode(payload, process.env.FOOTBALL_TOKEN)}; expires=${date.toGMTString()}; Path=/`;
  }

  let server;

  async function startUp (http, serverDestroy,Router, finalhandler, Responder, logger, dbOpen) {
    let db;
    let dbRollbackOnFailure = false;
    try {
      /*
        start off a process to find the version of the app, and the copyright year
      */

      //try and open the database, so that we can see if it us upto date
      db = await dbOpen();
      const {value: dbversion } = await db.get(`SELECT value FROM settings WHERE name = 'version'`);
      const version = parseInt(process.env.FOOTBALL_DB_VERSION,10);
      debugdb('database is at version ', dbversion, ' we require ', version);
      if (dbversion !== version) {
        if (dbversion > version) throw new Error('Setting Version in Database too high');
        await db.exec('PRAGMA foreign_keys = OFF;')
        await db.exec('BEGIN EXCLUSIVE');
        dbRollbackOnFailure = true;
        for(let i = dbversion; i < version; i++) {
          const update = await fs.readFile(
            path.resolve(__dirname, 'db-init',`update_${i}.sql`), 
            { encoding: 'utf8' }
          );
          debugdb('About to update database from version ',i);
          await db.exec(update);
        }
        debugdb('Completed Updates');
        await db.exec('COMMIT');
        dbRollbackOnFailure = false;
        await db.exec('VACUUM');
        await db.exec('PRAGMA foreign_keys = ON;')
        debug('Committed Updates, ready to go')
      }
    } catch (e) {
      if (e.code === 'SQLITE_CANTOPEN') {
        debugdb('could not open database as it did not exist - so now going to create it');
        await require('./dbcreate')();
      } else {
        logger('error', `Failed to set up database, because of error ${e}`);
      };
      if (dbRollbackOnFailure) db.exec('ROLLBACK');
    } finally {
      if (db) db.close();
    }
    try {
      const routerOpts = {mergeParams: true};
      const router = Router(routerOpts);  //create a router
      const api = Router(routerOpts);
      const conf = Router();
      const reg = Router(routerOpts);
      const ses = Router();
      const cid = Router(routerOpts);
      const cidrid = Router(routerOpts);
    
      debug('tell router to use api router for /api/ routes');
      router.use('/api/', api);
      /*
        Our first set of calls are almost related to the static files.  They are a few api calls to retrieve configuration items
        and as such will be get requests and will have no requirements for ony other parameters.  They are of the form
        /api/config/xxxx

      */
     debug('setting up config apis');
      api.use('/config/', conf);
      const confs = loadServers(__dirname, 'config');
      for (const config in confs){
        debugapi(`Set up /api/config/${config} route`);
        conf.get(`/${config}`, async (req,res) => {
          debugapi(`Received /api/config/${config} request`);
          try {
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'X-Accel-Buffering': 'no'
            });
            const response = await confs[config](dbOpen);
            res.end(JSON.stringify(response));
          } catch (e) {
            forbidden(req, res, e.toString());
          }
        });
      }
      /*
        we follow by building routes which are supported by files in the reg directory.  These are the api calls which
        a made from links we will have sent the user by e-mail.  As such they are get requests which will be of a form
        /api/reg/xxxx/:token where xxx is the filename in the directory and :token will be a jwt which has been encoded for 
        us to identify the user.  Successfull processing of this request  will result in a 302 response (temporary redirect)
        to /index.html 
      */
      debug('Setting up Registration Apis')
      api.use('/reg/', reg);
      const regapis = loadServers(__dirname, 'reg');
      for (const regapi in regapis ) {
        debugapi(`Setting up /api/reg/${regapi} route`);
        reg.get(`/${regapi}/:token`, async (req,res) => {  //so we declare a route for this file
          debugapi(`Received /api/reg/${regapi} request`);
          try {
            const payload = jwt.decode(req.params.token, process.env.FOOTBALL_TOKEN);
            const cid = await regapis[regapi] (payload,dbOpen);  //then call it
            res.writeHead(302, {
              'Location': '/index.html',
              'Set-Cookie': generateCookie(payload.uid, cid),
              'Content-Type': 'text/html',
              'Cache-Control': 'no-cache',
              'X-Accel-Buffering': 'no' 
            });
            res.end();
          } catch(e) {
            forbidden(req, res, e.toString());
          }

        })
      }

      /*
        The next set of routes are from the session directory.  These are routes 
        that occur before the session manager has establised who you are and given you a
        cookie confirming that you are logged in. Since all requests beyond here are POST
        requests, we also introduce a parser to parse the body of the message.
        Requests in this section take a url of /api/session/xxx

      */

      api.use(bodyParser);
      debug('Setting up Session Apis')
      api.use('/session/',ses);

      const sessions = loadServers(__dirname, 'session');  //pre - cookie calls
      //this defines our routes - we require everything to be a post
      for (const session in sessions) {
        debugapi(`Setting up /api/session/${session} route`);
        ses.post(session, async (req, res) => {
          debugapi(`Received /api/session/${session} request`);
          try {
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'X-Accel-Buffering': 'no'
            });
            const responder = new Responder(res);
            await sessions[session](req.body,dbOpen, responder);
            responder.end();
          } catch (e) {
            forbidden(req, res, e.toString());
          }
        });
      }
      /*
          From this point on, all calls expect the user to be logged on and so we first introduce some middle where that will check that
          and return an unauthorised response if someone attempts to use it.

          First we have the basic api requests - mostly for administrative purposes unrelated to foot ball
      */

      debug('Setting up to Check Cookies from further in');
      api.use((req, res, next) => {
        debugapi('checking cookie');
        const cookies = req.headers.cookie;
        if (!cookies) {
          forbidden(req, res,'No Cookie');
          return;
        }
        const matches = cookies.match(/^(.*; +)?MBBALL=([^;]+)(.*)?$/);
        if (matches) {
          debugapi('Cookie found')
          const token = matches[2];
          try {
            const payload = jwt.decode(token, process.env.FOOTBALL_TOKEN);  //this will throw if the cookie is expired
            req.user = {
              uid: payload.uid,
              cid: payload.cid
            }
            res.setHeader('Set-Cookie', generateCookie(payload.uid,payload.cid)); //refresh cookie to the new value
          } catch (error) {
            forbidden(req,res, 'Invalid Auth Token');
          }
        } else {
          forbidden(req, res, 'Invalid Cookie');
        }
      });
      /*
          we now need to process the admin type api calls
      */
      debug('Setting up Admin Apis');
      const apis = loadServers(__dirname, 'admin');
      for (const adm in apis) {
        debugapi(`Setting up /api/${adm} route`);
        api.post(`/${adm}`, async (req,res) => {
          debugapi(`Received /api/${adm} request`);
          try {
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'X-Accel-Buffering': 'no'
            });
            const responder = new Responder(res);
            await apis[adm](req.user,req.body,dbOpen,responder);
            responder.end();  //responder doesn't mind multiple ends, so we do it here just incase.
          } catch(e) {
            forbidden(req, res, e.toString());
          }
        })
      }
      /*
        Quite a lot of the api calls will feature the cid (competition id) and rid(round id) as parameters to them
        although not strictly necessary, I am going to create two separate api sets for /api/:cid/xxx and /api/:cid/:rid/xxx
        urls to see how they work
      */
      debug('Setting Up cid and cidrid Apis');
      api.use('/:cid/', cid);
      cid.use('/:rid/', cidrid);
      const cids = loadServers(__dirname, 'cid');
      const cidrids = loadServers(__dirname, 'cidrid');
      for (const c in cids) {
        debugapi(`Setting up /api/:cid/${c} route`);
        cid.post(`/${c}`, async (req, res) => {
          debugapi(`Received /api/:cid/${c} request, cid=`,req.params.cid);
          try {
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'X-Accel-Buffering': 'no'
            });
            const responder = new Responder(res);
            await cids[c](req.user, req.params.cid, req.body, dbOpen, responder);
            responder.end();  //responder doesn't mind multiple ends, so we do it here just incase.
          } catch (e) {
            forbidden(req, res, e.toString());
          }
        })
      }
      for (const r in cidrids) {
        debugapi(`Setting up /api/:cid/:rid/${r} route`);
        cidrid.post(`/${r}`, async (req, res) => {
          debugapi(`Received /api/:cid/:rid/${r} request, cid= ${req.params.cid} rid= ${req.params.rid}`);
          try {
            res.writeHead(200, {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'X-Accel-Buffering': 'no'
            });
            const responder = new Responder(res);
            await cidrids[r](req.user, req.params.cid, req.params.rid, req.body, dbOpen, responder);
            responder.end();  //responder doesn't mind multiple ends, so we do it here just incase.
          } catch (e) {
            forbidden(req, res, e.toString());
          }
        })
      }
      debug('Creating Web Server');
      server = http.createServer((req,res) => {
        router(req,res,finalhandler(req,res, {onerror: finalErr}))
      });
      server.listen(parseInt(process.env.FOOTBALL_PORT, 10), '0.0.0.0');
      serverDestroy(server);
      const {version} = await versionPromise;
      logger('app', `Release ${version} of Football Web Server Operational on Port:${process.env.FOOTBALL_PORT} using node ${process.version}`);
    } catch(e) {
      logger('error', 'Initialisation Failed with error ' + e.toString());
    }
  }
  async function close() {
  // My process has received a SIGINT signal

    if (server) {
      logger('app', 'Starting Football Web Server ShutDown Sequence');
      try {
        const tmp = server;
        server = null;
        //we might have to stop more stuff later, so leave as a possibility
        tmp.destroy();
        logger('app', 'Football web Server ShutDown Complete');
      } catch (err) {
        logger('error', `Trying to close caused error:${err}`);
      }
    }
    process.exit(0);
  }
  if (!module.parent) {
    //running as a script, so call startUp
    debug('Startup as main script');
    startUp(http, serverDestroy, Router, finalhandler, Responder, logger, dbOpen);
    process.on('SIGINT',close);
  }
  module.exports = {
    startUp: startUp,
    close: close
  };
})();
