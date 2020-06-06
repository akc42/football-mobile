
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
  const debugapi = require('debug')('football:api');
  const path = require('path');
  require('dotenv').config({path: path.resolve(__dirname,'db-init','football.env')});
  
  const fs = require('fs').promises;

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
  const errorLogger = require('./session/log');

  const dbOpen = require('./utils/database');



  
  const cookieConfig = {};


  function loadServers(webdir, relPath) {
    return includeAll({
      dirname: path.resolve(webdir, relPath),
      filter: /(.+)\.js$/
    }) || {};
  }
  function forbidden(req,res, message) {
    debug('In "forbidden"');
    logger('auth', `${message} with request url of ${req.originalUrl}`, req.headers['x-forwarded-for']);
    res.statusCode = 403;
    res.end();
  }
  function header(res) {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no'
    });
  }
  function finalErr (err, res, req) {
    logger('error', `Final Error at url ${req.originalUrl} with error ${err.stack}`);
  }

  function generateCookie(user, usage) {
    const date = new Date();
    const type = usage || 'play';
    const expiry = user.remember !== 0;
    if (type !== 'logoff') {
      date.setTime(date.getTime() + (cookieConfig.cookieExpires * 60 * 60 * 1000));
      const payload = {
        exp: Math.round(date.getTime()/1000),
        user: user,
        usage: type
      };
      debug('generated cookie for uid ', user.uid, ' expires ', expiry ? date.toGMTString() : 0);
      return `${cookieConfig.cookieName}=${jwt.encode(payload, cookieConfig.cookieKey)}; expires=${expiry ? date.toGMTString(): 0}; Path=/`;
    } else {
      return `${cookieConfig.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;
    }

  }

  let server;
  let db;

  async function startUp (http, serverDestroy,Router, finalhandler, Responder, logger, dbOpen) {
    try {
      /*
        start off a process to find the version of the app, and the copyright year
      */

      //try and open the database, so that we can see if it us upto date
      db = await dbOpen();
      const { value: dbversion } = await db.get('SELECT value FROM settings WHERE name = "version"');
      const footVersion = parseInt(process.env.FOOTBALL_DB_VERSION,10);
      debug('database is at version ', dbversion, ' we require ', footVersion);
      if (dbversion !== footVersion) {
        if (dbversion > footVersion) throw new Error('Setting Version in Database too high');
        await db.exec('PRAGMA foreign_keys = OFF;')
        await db.exec('BEGIN EXCLUSIVE');
 
        for(let i = dbversion; i < footVersion; i++) {
          const update = await fs.readFile(
            path.resolve(process.env.FOOTBALL_DB_DIR,`update_${i}.sql`), 
            { encoding: 'utf8' }
          );
          debug('About to update database from version ',i);
          await db.exec(update);
        }
        debug('Completed Updates');
        await db.exec('COMMIT');

        await db.exec('VACUUM');
        await db.exec('PRAGMA foreign_keys = ON;')
        debug('Committed Updates, ready to go')
      }
      await db.exec('BEGIN TRANSACTION');
      const s = await db.prepare('SELECT value FROM settings WHERE name = ?');
      const { value: serverPort } = await s.get('server_port');
      const { value: cookieName } = await s.get('cookie_name');
      const { value: cookieKey } = await s.get('cookie_key');
      const { value: cookieExpires } = await s.get('cookie_expires');
      const { value: cookieVisitName } = await s.get('cookie_visit_name');
      await s.finalize();
      await db.exec('COMMIT');
      await db.close();
      cookieConfig.cookeName = cookieName;
      cookieConfig.cookieKey = cookieKey;
      cookieConfig.cookieExpires = cookieExpires;

      const routerOpts = {mergeParams: true};
      const router = Router(routerOpts);  //create a router
      const api = Router(routerOpts);
      const conf = Router();
      const reg = Router(routerOpts);
      const ses = Router(routerOpts);
      const cid = Router(routerOpts);
      const cidrid = Router(routerOpts);
    
      debug('tell router to use api router for /api/ routes');
      router.use('/api/', api);
      /*
        Just a little helper utility for development - not normally needed
      */
     debug('setup delete visit cookie helper')
      api.get('/deletecookie', (req,res) => {
        debugapi('Received Delete Cookie request')
        const cookie = `${cookieVisitName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;
        res.setHeader('Set-cookie', cookie);
        header(res);
        res.end('DONE');
      });
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
            header(res)
            const response = await confs[config]();
            res.end(JSON.stringify({...response, status: true}));
          } catch (e) {
            res.end(JSON.stringify({status: false}));
            errorLogger(req.headers,{topic:`config/${config}`, message: e});
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
            const payload = jwt.decode(req.token, cookieKey);
            const success = await regapis[regapi] (payload);  //then call it
            if (success) { //we signal problem with the passed in link with a simple boolean response
              res.setHeader('Set-Cookie', generateCookie(payload.user, payload.usage)); //refresh cookie to the new value 
            }
            res.writeHead(302, {
              'Location': '/index.html',
              'Content-Type': 'text/html',
              'Cache-Control': 'no-cache',
              'X-Accel-Buffering': 'no' 
            });
            res.end();
          } catch(e) {
            forbidden(req, res, e.toString());
          }
        });
      }

      /*
         Beyond here, if the user doesn't have the visit cookie set, this is most likely a spoofed attempt, so
         we need to check it.  From a users perspective we will have silently ignored his request, from our perspective
         we just log it with ip address.
       */

      debug('Setting up to check Visit Cookie')
      api.use((req, res, next) => {
        debugapi('checking for Visit Cookie')
        const cookies = req.headers.cookie;
        if (!cookies) {
          logger('auth', `Attempt to access ${req.url} without a Visit Cookie`, req.headers['x-forwarded-for']);
        } else {
          const mbvisited = new RegExp(`^(.*; +)?${cookieVisitName}=([^;]+)(.*)?$`);
          const matches = cookies.match(mbvisited);
          if (matches) {
            debugapi('Visit Cookie found');
            next();
          } else {
            logger('auth', `Attempt to access ${req.url} without a Visit Cookie`, req.headers['x-forwarded-for']);
          }
        }
      });

      /*
        The next set of routes are from the session directory.  These are routes 
        that occur before the session manager has establised who you are and given you a
        cookie confirming that you are logged in. Since all requests beyond here are POST
        requests, we also introduce a parser to parse the body of the message.
        Requests in this section take a url of /api/session/xxx

      */

      api.use(bodyParser.json());

      debug('Setting up Session Apis')
      api.use('/session/',ses);

      const sessions = loadServers(__dirname, 'session');  //pre - cookie calls
      //this defines our routes - we require everything to be a post
      for (const session in sessions) {
        debugapi(`Setting up /api/session/${session} route`);
        ses.post(`/${session}`, async (req, res) => {
          debugapi(`Received /api/session/${session} request`);
          try {
            const data = await sessions[session](req.headers,req.body);
            header(res);
            res.end(JSON.stringify({status:true, data: data }));
          } catch (e) {
            forbidden(req, res, e.toString());
          } 
        });
      }
      /*
          From this point on, all calls expect the user to be logged on and so we first introduce some middleware that will check that
          and return an unauthorised response if someone attempts to use it.
      */

      debug('Setting up to Check Cookies from further in');
      api.use((req, res, next) => {
        debugapi('checking cookie');
        const cookies = req.headers.cookie;
        if (!cookies) {
          forbidden(req, res, 'No Cookie');
          return;
        }
        const mbball = new RegExp(`^(.*; +)?${cookieName}=([^;]+)(.*)?$`);
        const matches = cookies.match(mbball);
        if (matches) {
          debugapi('Cookie found')
          const token = matches[2];
          try {
            const payload = jwt.decode(token, cookieKey);  //this will throw if the cookie is expired
            req.user = payload.user;
            req.usage = payload.usage
            res.setHeader('Set-Cookie', generateCookie(payload.user,payload.usage)); //refresh cookie to the new value 
            next();
          } catch (error) {
            forbidden(req,res, 'Invalid Auth Token');
          }
        } else {
          forbidden(req, res, 'Invalid Cookie');
        }
      });
      /*
        at this point in the chain we can now add validate user.  We have got a valid cookie
        with possible different uses.  validate user wants to know what they are.
      */
     debug('Set up to validate user');
      api.post('validate_user',(req,res) => {
        debugapi('we got a validate user, respond with uid',req.user.uid,' usage', req.usage);
        header(res);
        res.end(JSON.stringify({user:req.user,usage:req.usage, status: true}));
      });
      /*
        Beyond here we are only allowed if our cookie specified a usage of play, so we need some middleware to detect it
      */
      debug('Set up to check cookie usage');
      api.use((req,res,next) => {
        debugapi('checking cookie usage')
        if (req.usage === 'play') {
          next();
        } else {
          forbidden(req,res, `Incorrect Usage in Cookie of ${req.usage}`);
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
          const responder = new Responder(res);
          try {
            header(res);
            await apis[adm](req.user,req.body,responder);
            responder.addSection('status', true);
            
          } catch(e) {
            responder.addSection('status', false);
            errorLogger(req.headers, { topic: `admin/${adm}`, message: e });
          }
          responder.end();
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
          const responder = new Responder(res);
          try {
            header(res);
            await cids[c](req.user, req.params.cid, req.body, responder);
            responder.addSection('status', true);
          } catch (e) {
            responder.addSection('status', false);
            errorLogger(req.headers, { topic: `cid/${c}`, message: e });
          }
          responder.end(); 
        }); 
      }
      for (const r in cidrids) {
        debugapi(`Setting up /api/:cid/:rid/${r} route`);
        cidrid.post(`/${r}`, async (req, res) => {
          debugapi(`Received /api/:cid/:rid/${r} request, cid= ${req.params.cid} rid= ${req.params.rid}`);
          const responder = new Responder(res);
          try {
            header(res);
            await cidrids[r](req.user, req.params.cid, req.params.rid, req.body, responder);
            responder.addSection('status', true);
          } catch (e) {
            responder.addSection('status', false);
            errorLogger(req.headers, { topic: `cid/${c}`, message: e });
          }
          responder.end();  
        })
      }
      debug('Creating Web Server');
      server = http.createServer((req,res) => {
        router(req,res,finalhandler(req,res, {onerror: finalErr}))
      });
      server.listen(serverPort, '0.0.0.0');
      serverDestroy(server);
      const {version} = await versionPromise;
      logger('app', `Release ${version} of Football Web Server Operational on Port:${serverPort} using node ${process.version}`);
    } catch(e) {
      logger('error', 'Initialisation Failed with error ' + e.toString());
      await close();
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
    if (db) {
      try {
        await db.close();
      } catch(e) {
        //do nothing - it probably wasn't open
      }
      db = null;
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
