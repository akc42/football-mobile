const clientlogger = require('./utils/clientlogger');

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
  const versionPromise = require('./utils/version');
  
  const bcrypt = require('bcrypt');
  const clientLogger = require('./utils/clientlogger');
  const serverConfig = {};
  


  function loadServers(rootdir, relPath) {
    return includeAll({
      dirname: path.resolve(rootdir, relPath),
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
            if (fs.existsSync(path.resolve(__dirname, 'db-init', `pre-upgrade_${version}.sql`))) {
              //if there is a site specific update we need to do before running upgrade do it
              const update = fs.readFileSync(path.resolve(__dirname, 'db-init', `pre-upgrade_${version}.sql`), { encoding: 'utf8' });
              db.exec(update);
            }
            const update = fs.readFileSync(path.resolve(__dirname, 'db-init', `upgrade_${version}.sql`),{ encoding: 'utf8' });
            db.exec(update);
            if (fs.existsSync(path.resolve(__dirname, 'db-init', `post-upgrade_${version}.sql`))) {
              //if there is a site specific update we need to do after running upgrade do it
              const update = fs.readFileSync(path.resolve(__dirname, 'db-init', `post-upgrade_${version}.sql`), { encoding: 'utf8' });
              db.exec(update);
            }
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

        serverConfig.membershipKey = s.get('membership_key');
      })();


      const routerOpts = {mergeParams: true};
      const router = Router(routerOpts);  //create a router
      const api = Router(routerOpts);
      const conf = Router(routerOpts);
      const ses = Router(routerOpts);
      const prof = Router(routerOpts);
      const usr = Router(routerOpts);
      const approv = Router(routerOpts);
      const admin = Router(routerOpts);
      const gadm = Router(routerOpts);
      
    
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
        conf.get(`/${config}/`, async (req, res) => {
          debugapi(`Received /api/config/${config} request`);
          try {
            const response = await confs[config](req.headers);
            res.end(response);
          } catch (e) {
            errored(req, res, `config/${config} failed with ${e}`);
          }
        });
      }
      debug('setting up logging api');
      
      api.get('/log/:topic/:message/:gap', async (req,res) => {
        clientlogger(req.params,req.headers);
        res.end();
      })

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
          location = payload.usage;
          debugapi('/api/pin payload uid', payload.uid);
          const result = db.prepare(`SELECT * FROM participant WHERE ${payload.uid === 0 ? 'email': 'uid'} = ?`)
            .get(payload.uid === 0 ? payload.email: payload.uid);
          if (result !== undefined) {
            debugapi('/api/pin found the user with email ', result.email);
            const correct = await bcrypt.compare(payload.pin, result.verification_key);
            if (correct) {
              debugapi('/api/pin pin is correct, so update verification_key to NULL');
              /*
                we got the expected result so we can reset the verification key
                If the token included an e-mail address, we were verifing a new email, so we update
                that also.
              */
              if (result.waiting_approval === 1) {
                /*
                  still a member awaiting approval, so can't allow log-on.  The best we can do is
                  clear the current password and so when they enter their e-mail address, we redirect them
                  to set up a password.
                */
                db.prepare('UPDATE participant SET password = NULL,  verification_key = NULL, email = ? WHERE uid = ?')
                  .run(payload.email ? payload.email : result.email, payload.uid);
              } else {
                //already a full member, so we can generate a one time cookie to all them to login.
                db.prepare('UPDATE participant SET verification_key = NULL, email = ? WHERE uid = ?')
                  .run(payload.email? payload.email:result.email,payload.uid);
                debugapi('/api/pin setting up cookie for user', payload.uid);
                res.setHeader('Set-Cookie', generateCookie(
                  {
                    ...result,
                    password: !!result.password,
                    verification_key: false,
                    remember: 0, //force a session cookie, so the cookie doesn't persist.
                  }));
                }
            } else {
              debugapi('/api/pin password incorrect, add #expired to return path');
              location = '/#expired';
            }
          } else if (payload.uid === 0 ) {
            /*
              We are going to try and invent a username for the user (they can change it later).  We do this by
              taking their email address and extracting the part before the @ sign
              Then we progressively try that (lets call it xxx), and then xxx_0, xxx_1 etc unitl we have a unique
              name.
            */
            
            let suffix = '';
            let suffixCount = 0;
            const parts = payload.email.split('@');
            debugapi('/api/pin insert new member - make username based on', parts[0]);
            const count = db.prepare('SELECT COUNT(*) FROM participant WHERE name = ?').pluck();
            const newMember = db.prepare(`INSERT INTO participant (name, email, waiting_approval, password) VALUES( ?,?,1,?)`);
            db.transaction(() => {
              while (count.get(`${parts[0]}${suffix}`) > 0) {
                suffix = `_${suffixCount++}`;
                debugapi('/api/pin/ new member, not unique name, so trying with suffix', suffix);
              }
              newMember.run(`${parts[0]}${suffix}`,payload.email, payload.password); //password already hashed.
            })();
          } else {
            debugapi('/api/pin user not found, add #expired to return path')
            location = '/#expired';
          }
      
        } catch (e) {
          /*
            most likely reason we get here is token had expired.  We want to tell the user politely so we will
            just set the visit cookie to say the pin expired, and the client can deal with it
          */
          debugapi('In /api/pin failed with error',e.toString());
          location = '/#expired';
        }
        debugapi(`In /api/pin set 302 header for ${location}`);
        res.statusCode = 302;
        res.setHeader('Location', location);
        res.setHeader('Content-Type', 'text/html');
        res.end();
        debugapi('/api/pin sent end');
      });
      /*
        the next is a special route used to load a tracking id.  This call "generates" a javascript file to provide a tracking id
      */
      debug('setting up tracking.js response')
      api.get('/tracking.js', (req,res) => {
        debugapi('got /api/tracking.js request')
        const token = req.headers['if-none-match'];
        const modify = req.headers['if-modified-since'];
        const ip = req.headers['x-forwarded-for'];  //note this is ip Address Now, it might be different later. Is a useful indication for misuse.
        function makeResponse(res,sid) {
          const payload = {
            sid: sid,
            ip: ip
          };
          debugapi('making response of sid', sid, 'ip', ip);
          const token = jwt.encode(payload, serverConfig.membershipKey);
          debugapi('tracking token = ', token);
          res.writeHead(200, {
            'ETag': token,
            'Last-Modified': new Date(0).toUTCString(),
            'Cache-Control': 'private, max-age=31536000, s-max-age=31536000, must-revalidate',
            'Content-Type': 'application/javascript'
          })
          res.write(`
             const cid = '${token}';
             export default cid;
          `);
        }
        
        if (token !== undefined && token.length > 0) {
          debugapi('tracking token found as ', token);
          try {
            const payload = jwt.decode(token, serverConfig.membershipKey);
            debugapi('Decoded tracking token as payload', payload);
            res.statusCode = 304;
          } catch(e) {
            // someone has been messing with things, lets generate some code that
            makeResponse(res, 'NoEmail');
          }
        } else if (modify !== undefined && modify.length > 0) {
          debugapi('tracking modify has a date so 304 it');
          res.StatusCode = 304;
        } else {
          makeResponse(res, new Date().getTime().toString()); //unique enough id
        }
        res.end();
        debugapi('/api/tracking.js response complete');
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
          try {
            const data = await sessions[session](req.body, req.headers);
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

      debug('Setting up to Check Token In URL from further in');
      
      api.use((req, res, next) => {
        debugapi('checking token');
        const token = req.body.token;
        if (!token) {
          forbidden(req, res, 'No Token');
          return;
        }
        debugapi('Token found');
        try {
          const payload = jwt.decode(token, serverConfig.cookieKey);  //this will throw if the cookie is expired
          req.user = payload.user;
          next();
        } catch (error) {
          forbidden(req,res, 'Invalid Auth Token');
          }
      });

      /*
          we now need to process the profile api calls
      */
      api.use('/profile/',prof);
      debug('Setting up Profile Apis');
      const profs = loadServers(__dirname, 'profile');
      for (const p in profs) {
        debugapi(`Setting up /api/profile/${p} route`);
        prof.post(`/${p}`, async (req,res) => {
          debugapi(`Received /api/profile/${p} request`);
          try {
            const data = await profs[p](req.user,req.body,req.headers);
            res.end(JSON.stringify(data));
          } catch(e) {
            errored(req,res,e.toString());
          }
        })
      }

      /*
        Beyond here we are going to check for member approval capability in the madmin section only
      */
      debug('Setting up approve api')
      api.use('/approve/', approv);
      debug('set up to check member_approval capability')
      approv.use((req,res,next) => {
        debugapi('checking member_approval');
        if (req.user.global_admin === 1 || req.user.member_approval === 1) { //global admin can do this too
          next();
        } else {
          forbidden(req, res, `User uid ${req.user.uid} has not got member approval capability`);
        }
      });
      const maps = loadServers(__dirname, 'approve');
      for (const m in maps) {
        debugapi(`setting up /api/approve/${m} route`);
        approv.post(`/${m}`, async (req,res) => {
          debugapi(`received /api/approve/${m} request`);
          try {
            const responder = new Responder(res);
            await maps[m](req.user,req.body, req.headers,responder);
            responder.end();
          } catch(e) {
            errored(req, res, e.toString());
          }
        });
      }
      /*
        Beyond here we are going to check for global admin capability in the gadmin section only
      */
      debug('Setting up gadm api')
      api.use('/gadm/', gadm);
      debug('set up to check global admin capability')
      gadm.use((req, res, next) => {
        debugapi('checking global admin');
        if (req.user.global_admin === 1) {
          next();
        } else {
          forbidden(req, res, `User uid ${req.user.uid} has not got global admin capability`);
        }
      });

      const gadms = loadServers(__dirname, 'gadm');
      for (const g in gadms) {
        debugapi(`setting up /api/gadm/${g} route`);
        gadm.post(`/${g}`, async (req, res) => {
          debugapi(`received /api/gadm/${g} request`);
          try {
            const responder = new Responder(res);
            await gadms[g](req.user, req.body, responder);
            responder.end();
          } catch (e) {
            errored(req, res, e.toString());
          }
        });
      }

      debug('Setting Up Competition Administration');
      api.use('/admin/:cid', admin);
      /*
        Beyond here we are going to check for user us this competitions admin in the cadmin section only
      */

      debug('set up to check competition admin capability')
      admin.use((req, res, next) => {
        debugapi(`checking user ${req.user.uid} is admin of competition ${req.params.cid}`);
        if (req.user.global_admin === 1) {
          debugapi('global admin has access automatically')
          next();
        } else {
          const admin = db.prepare('SELECT administrator FROM competition WHERE cid = ?').pluck().get(req.params.cid);
          if (admin === req.user.uid) { 
            debugapi('user is competition admin');
            next();
          } else {
            forbidden(req, res, `User uid ${req.user.uid} has is not admin of competition ${req.params.cid}`);
          }
        }
      });
      const admins = loadServers(__dirname, 'admin');
      for (const a in admins) {
        debugapi(`setting up /api/admin/:cid/${a} route`);
        admin.post(`/${a}`, async (req, res) => {
          debugapi(`received /api/admin/${req.params.cid}/${a}`);
          try {
            const responder = new Responder(res);
            await admins[a](req.user,parseInt(req.params.cid,10),req.body, responder);
            responder.end();
          } catch (e) {
            errored(req, res, e.toString());
          }
        });
      }
      /*
        Finally just the simple user apis
      */
      api.use('/user/:cid',usr);
      debug('Setting Up Users');
      const users = loadServers(__dirname, 'user');      
      for (const u in users) {
        debugapi(`Setting up /api/user/:cid/${u} route`);
        usr.post(`/${u}`, async (req, res) => {
          debugapi(`Received /api/user/${req.params.cid}/${u}`);
          try {
            const responder = new Responder(res);
            await users[u](req.user, parseInt(req.params.cid,10), req.body, responder);
            responder.end(); 
          } catch (e) {
            errored(req,res,e.toString());
          } 
        }); 
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
