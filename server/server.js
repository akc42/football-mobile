
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
  const db = require('./utils/database'); //this has to come after environment is set up
  
  const fs = require('fs');

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
  
  const bcrypt = require('bcrypt');

  const serverConfig = {};
  


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
    res.end('---403---'); //definitely not json, so should cause api to throw even if attempt to send status code is to no avail

  }
  function errored(req,res,message) {
    debug('In "Errored"');
    logger('error', `${message} with request url of ${req.originalUrl}`, req.headers['x-forwarded-for']);
    res.statusCode = 500;
    res.end('---500---'); //definitely not json, so should cause api to throw even if attempt to send status code is to no avail.

  }

  function finalErr (err, res, req) {
    logger('error', `Final Error at url ${req.originalUrl} with error ${err.stack}`);
  }

  function generateCookie(user, usage) {
    const date = new Date();
    const expiry = user.remember !== 0;
    if (usage !== 'logoff') {
      date.setTime(date.getTime() + (serverConfig.cookieExpires * 60 * 60 * 1000));
      const payload = {
        exp: Math.round(date.getTime()/1000),
        user: user,
        usage: usage
      };
      debug('generated cookie', serverConfig.cookieName ,'for uid ', user.uid, ' expires ', expiry ? date.toGMTString() : 0);
      return `${serverConfig.cookieName}=${jwt.encode(payload, serverConfig.cookieKey)}; expires=${expiry ? date.toGMTString(): 0}; Path=/`;
    } else {
      return `${serverConfig.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;
    }

  }

  let server;

  function startUp (http, serverDestroy,Router, finalhandler, Responder, logger, db, bcrypt) {
    try {
      /*
        start off a process to find the version of the app, and the copyright year
      */

      //try and open the database, so that we can see if it us upto date
      const version = db.prepare(`SELECT value FROM settings WHERE name = 'version'`).pluck();
      const dbVersion = version.get();

      const footVersion = parseInt(process.env.FOOTBALL_DB_VERSION,10);
      debug('database is at version ', dbVersion, ' we require ', footVersion);
      if (dbVersion !== footVersion) {
        if (dbVersion > footVersion) throw new Error('Setting Version in Database too high');
        db.pragma('foreign_keys = OFF');
        const upgradeVersions = db.transaction(() => {
          for (let version = dbVersion; version < footVersion; version++) {
            const update = fs.readFileSync(path.resolve(process.env.FOOTBALL_DB_DIR, `update_${version}.sql`),{ encoding: 'utf8' });
            db.exec(update);
          }
        });
        upgradeVersions.exclusive();
        db.exec('VACUUM');
        db.pragma('foreign_keys = ON');
        
        debug('Committed Updates, ready to go')
      }
      /*
        just a little helper, to clear out expired verification keys.  In production we would expect restarts to be infrequent
        but in a cron job, we could just tell pm2 to restart it once a month or something
      */

      db.transaction(() => {
        const clearkeys = db.prepare(`UPDATE Participant SET verification_key = NULL WHERE verification_key IS NOT NULL
        AND verification_sent < (strftime('%s', 'now') - ( 60 * 60 * (
        SELECT value FROM Settings WHERE name = 'verify_expires' )));`);
        const s = db.prepare('SELECT value FROM settings WHERE name = ?').pluck();
        clearkeys.run();
        serverConfig.serverPort = s.get('server_port');
        serverConfig.cookieName = s.get('cookie_name');
        serverConfig.cookieKey = s.get('cookie_key');
        serverConfig.cookieExpires = s.get('cookie_expires');
        serverConfig.cookieVisitName = s.get('cookie_visit_name');
      })();


      const routerOpts = {mergeParams: true};
      const router = Router(routerOpts);  //create a router
      const api = Router(routerOpts);
      const conf = Router();
      const ses = Router(routerOpts);
      const cid = Router(routerOpts);
      const cidrid = Router(routerOpts);
    
      debug('tell router to use api router for /api/ routes');
      router.use('/api/', api);
      /*
        Just a little helper utility for development - not normally needed
      */
     debug('setup delete visit cookie helper')
      api.get('/delete_cookie', (req,res) => {
        debugapi('Received Delete Cookie request with names as ', serverConfig.cookieName, ' and ', serverConfig.cookieVisitName);
        const cookie = `${serverConfig.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;
        const vcookie = `${serverConfig.cookieVisitName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/`;
        res.setHeader('Set-cookie', [cookie, vcookie]);
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
            const response = await confs[config]();
            res.end(JSON.stringify(response));
          } catch (e) {
            errored(req, res, `config/${config} failed with ${e}`);
          } 
        });
      }
 
      /*
        the next is a single route used by the e-mail tokens that are sent users.  this will decode the token and if valid
        will generate a cookie based on the usage field.  
      */
      debug('Setting up Pin check api')
      api.get('/pin/:token', async (req,res) => {
        debugapi(`Received /api/pin/ request with token`, req.params.token, 'to be decoded by ', serverConfig.cookieKey);;
        let location = '/';
        try {
          const payload = jwt.decode(req.params.token, serverConfig.cookieKey);
          debugapi('/api/pin payload uid', payload.user, 'pin', payload.pin);
          const result = db.prepare('SELECT * FROM participant WHERE uid = ?').get(payload.user);
          if (result !== undefined) {
            debugapi('/api/pin found the user');
            const correct = await bcrypt.compare(payload.pin, result.verification_key);
            if (correct) {
              debugapi('/api/pin pin is correct, so update verification_key to NULL');
              //we got the expected result so we can reset the verification key and return the usage in the payload (which will determine next step)
              db.prepare('UPDATE participant SET verification_key = NULL WHERE uid = ?').run(payload.user);
              debugapi('/api/pin setting up cookie for user', payload.user, ' with usage', payload.usage);
              res.setHeader('Set-Cookie', generateCookie(
                {
                  ...result,
                  password: !!result.password,
                  verification_key: false,
                  remember: 0, //force a session cookie, so the cookie doesn't persist.
                }, payload.usage));
            } else {
              debugapi('/api/pin password incorrect, add #linkexpired to return path');
              location = '/#linkexpired';
            }
          } else {
            debugapi('/api/pin user not found, add #linkexpired to return path')
            location = '/#linkexpired';
          }
      
        } catch (e) {
          /*
            most likely reason we get here is token had expired.  We want to tell the user politely so we will
            just set the visit cookie to say the pin expired, and the client can deal with it
          */
          debugapi('In /api/pin failed with error',e.toString());
          location = '/#linkexpired';
        }
        debugapi(`In /api/pin set 302 header for ${location}`);
        res.statusCode = 302;
        res.setHeader('Location', location);
        res.setHeader('Content-Type', 'text/html');
        res.end();
        debugapi('/api/pin sent end');
      });
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
          forbidden(req,res,'No cookies in request');
        } else {
          const mbvisited = new RegExp(`^(.*; +)?${serverConfig.cookieVisitName}=([^;]+)(.*)?$`);
          const matches = cookies.match(mbvisited);
          if (matches) {
            debugapi('Visit Cookie found');
            next();
          } else {
            forbidden(req,res,'no Visit Cookie Found');
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
            const data = await sessions[session](req.body, req.headers);
            if(data.usage!== undefined) {
              res.setHeader('Set-Cookie', generateCookie(data.user,data.usage)); //get ourselves a cookie
            }
            res.end(JSON.stringify(data));
          } catch (e) {
            errored(req, res, e.toString());
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
          we now need to process the admin type api calls
      */
      debug('Setting up Admin Apis');
      const apis = loadServers(__dirname, 'admin');
      for (const adm in apis) {
        debugapi(`Setting up /api/${adm} route`);
        api.post(`/${adm}`, (req,res) => {
          debugapi(`Received /api/${adm} request`);
          try {
            const responder = new Responder(res);
            apis[adm](req.user,req.body,responder);
            responder.end();            
          } catch(e) {
            errored(req,res,e.toString());
          }
        })
      }
      /*
        Beyond here we are only allowed if our cookie specified a usage of play, so we need some middleware to detect it
      */
      debug('Set up to check cookie usage');
      api.use((req, res, next) => {
        debugapi('checking cookie usage')
        if (req.usage === 'authorised') {
          next();
        } else {
          forbidden(req, res, `Incorrect Usage in Cookie of ${req.usage}`);
        }
      });
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
        cid.post(`/${c}`, (req, res) => {
          debugapi(`Received /api/:cid/${c} request, cid=`,req.params.cid);
          try {
            const responder = new Responder(res);
            cids[c](req.user, req.params.cid, req.body, responder);
            responder.end(); 
          } catch (e) {
            errored(req,res,e.toString());
          } 
        }); 
      }
      for (const r in cidrids) {
        debugapi(`Setting up /api/:cid/:rid/${r} route`);
        cidrid.post(`/${r}`, (req, res) => {
          debugapi(`Received /api/:cid/:rid/${r} request, cid= ${req.params.cid} rid= ${req.params.rid}`);
          try {
            const responder = new Responder(res);
            cidrids[r](req.user, req.params.cid, req.params.rid, req.body, responder);
            responder.end();
          } catch (e) {
            errored(req,res,e.toString());
          }
        })
      }
      debug('Creating Web Server');
      server = http.createServer((req,res) => {
        //standard values (although status code might get changed and other headers added);
        res.satusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-cache');
        const done = finalhandler(req,res,{onerr:finalErr});
        router(req,res,done);
        
      });
      server.listen(serverConfig.serverPort, '0.0.0.0');
      serverDestroy(server);
      versionPromise.then(info => 
        logger('app', `Release ${info.version} of Football Web Server Operational on Port:${
            serverConfig.serverPort} using node ${process.version}`));

    } catch(e) {
      logger('error', 'Initialisation Failed with error ' + e.toString());
      close();
    }
  }
  function close() {
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
    process.exit(0);  //database catches this and closed automatically
  }
  if (!module.parent) {
    //running as a script, so call startUp
    debug('Startup as main script');
    startUp(http, serverDestroy, Router, finalhandler, Responder, logger, db, bcrypt);
    process.on('SIGINT',close);
  }
  module.exports = {
    startUp: startUp,
    close: close
  };
})();
