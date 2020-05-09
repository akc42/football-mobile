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

  const path = require('path');

  require('dotenv').config({path: path.resolve(__dirname,'.env')});
  
  const fs = require('fs').promises;

  const http = require('http');
  const debug = require('debug')('football:web');
  const Router = require('router');
  const enableDestroy = require('server-destroy');

  const util = require('util');
  const url = require('url');
  const querystring = require('querystring');
  const logger = require('./logger');
  const child = require('child_process');
  const root = path.resolve(__dirname,'../');

// see https://stackoverflow.com/a/52171480/438737
  const cyrb53 = function(str, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ h1>>>16, 2246822507) ^ Math.imul(h2 ^ h2>>>13, 3266489909);
    h2 = Math.imul(h2 ^ h2>>>16, 2246822507) ^ Math.imul(h1 ^ h1>>>13, 3266489909);
    return 4294967296 * (2097151 & h2) + (h1>>>0);
  };

  const version = new Promise(resolve => {
    /*
      we use the following file to workout the copyright year. As the system becomes more stable
      this becomes harder to chose one that closely represents the latest changes. The obvious
      choice is the .env file, as that is normally built during the release of a new version
    */

    child.exec('git describe --abbrev=0 --tags',{cwd: root}, (err,stdout,stderr) => {
      let version;
      if (stderr) {
        logger('error', 'git describe failed reading verion number with ' + err.message);
        if (process.env.REC_VERSION) {
          version = process.env.REC_VERSION;
        } else {
          version = ':v0.0.0';
        }
      } else {
        version = stdout.trim();
      }
      resolve(version);
    });
  });

  const setTimeoutPromise = util.promisify(setTimeout);


  let server;
  let statusid = 0;
  const subscribedChannels = {};
  let statusTimer = 0;

  async function startUp (http, Router,enableDestroy, logger, Recorder, usb) {
    try {
      const routerOpts = {mergeParams: true};
      const router = Router(routerOpts);  //create a router
          
      debug('have server ssl keys about to create the http2 server')
      server = http.createServer((req,res) => {
        const reqURL = url.parse(req.url).pathname;
        debugfile('request for ', reqURL, ' received');

        function final(err) {
          if (err) {
            logger('url','Request Error ' + (err.stack || err.toString()));
          } else {
            logger('url','Request for ' + reqURL + ' not found');
          }
          //could not find so send a 404
          res.statusCode = 404;
          res.end();
        }
        router(req, res, final);

      });
      server.listen(parseInt(process.env.FOOTBALL_PORT,10),'0.0.0.0');
      enableDestroy(server);
      router.get('/api/:client/done',async (req,res) => {      });
      
      router.get('/api/:channel/:token/release', checkRecorder, async (req,res) => {});
      router.get('/api/:channel/:token/renew', checkRecorder,(req,res) => { });
      router.get('/api/:channel/:token/reset', checkRecorder, async (req,res) => { }); 
      router.get('/api/:channel/:token/start', checkRecorder, async (req,res) => {
        debug('got a start request with params ', req.params);
        res.statusCode = 200;
        res.end(JSON.stringify(await req.recorder.record(req.params.token)));
      });
      router.get('/api/status', (req,res) => {
        if (req.headers.accept && req.headers.accept == 'text/event-stream') {
          //we make our unique client id from their ip address
          const client = cyrb53(req.headers['x-forwarded-for']).toString(16);
          const response = res;
          debug('/api/status received creating/reusing channel ', client);
          res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no' 
          });
          if (subscribedChannels[client] === undefined) {
            subscribedChannels[client] = {response: response,channels: {}};
          } else {
            subscribedChannels[client].response = response;
          }
          req.once('end', () => {
            debug('client closed status channel ', client.toString());
            if (subscribedChannels[client] !== undefined) delete subscribedChannels[client].response;
            //we don't do anything else as they may come back and we need to have the correct picture
          });
          //don't do anymore until we have a version read (normally will have completed by now)
          version.then(version => {
            //before anything else we send the client info to the user (should wake him up if asleep)
            sendStatus('newid', {
              client: client, 
              renew: parseInt(process.env.RECORDER_RENEW_TIME,10),
              log: process.env.RECORDER_NO_REMOTE_LOG === undefined,
              warn: process.env.RECORDER_NO_REMOTE_WARN === undefined,
              version: version
            }, response);
            const status = {
              scarlett: recorders.scarlett !== undefined? recorders.scarlett.status : {connected: false},
              yeti: recorders.yeti !== undefined? recorders.yeti.status :{connected: false}
            };
            //then send the current status of all the microphones.
            sendStatus('status', status, response);
          });



        } else {
          res.writeHead(404);
          res.end();
        }
      });

      logger('app', 'Recorder Web Server Operational Running on Port:' +
          process.env.RECORDER_PORT + ' with Node Version: ' + process.version);
    } catch(err) {
      logger('error', `Error occurred in startup; error ${err}`);
      close();
    }
  }
  function checkRecorder(req, res, next) {
    debug('recording router channel = ', req.params.channel);
    if (recorders[req.params.channel] !== undefined) {
      debug('middleware found recorder ', req.params.channel);
      req.recorder =  recorders[req.params.channel];
      next();
    } else {
      next(`Requested channel ${req.params.channel} not plugged in`);
    }

  }

  function sendStatus(type, data, response) {
    debugstatus('send status of event type ', type, ' to ', response ? 'one client': 'all clients')
    if (response) {
      sendMessage(response, type, data);
    } else {
      for(const client in subscribedChannels) {
        if (subscribedChannels[client].response !== undefined) sendMessage(subscribedChannels[client].response, type, data);
      }
    }

  }
  function sendMessage(res,type,data) {
    statusid++;
    res.write(`id: ${statusid.toString()}\n`);
    res.write(`event: ${type}\n`);
    res.write("data: " + JSON.stringify(data) + '\n\n');
    debugstatus('message sent with data  ', data);
  }
  async function usbAttach(device) {
    if (device.deviceDescriptor.idVendor === parseInt(process.env.RECORDER_SCARLETT_VID,10) && 
        device.deviceDescriptor.idProduct === parseInt(process.env.RECORDER_SCARLETT_PID,10)) {
      debug('detected scarlett added');
      await setTimeoutPromise(parseInt(process.env.RECORDER_USB_SETTLE,10));  //allow interface to settle   
      recorders.scarlett = new Recorder(process.env.RECORDER_SCARLETT_HW, process.env.RECORDER_SCARLETT_FORMAT, process.env.RECORDER_SCARLETT_NAME);
      sendStatus('add', {channel: 'scarlett', name: recorders.scarlett.name});
      debug('created scarlett recorder');    
    } else if (device.deviceDescriptor.idVendor === parseInt(process.env.RECORDER_YETI_VID,10) && 
        device.deviceDescriptor.idProduct === parseInt(process.env.RECORDER_YETI_PID,10)) {
      debug('detected yeti added');
      await setTimeoutPromise(parseInt(process.env.RECORDER_USB_SETTLE,10));  //allow interface to settle   
      recorders.yeti = new Recorder(process.env.RECORDER_YETI_HW, process.env.RECORDER_YETI_FORMAT, process.env.RECORDER_YETI_NAME);
      sendStatus('add', {channel: 'yeti', name: recorders.yeti.name});
      debug('created yeti recorder');    
    
    }
  }

  async function usbDetach(device) {
    if (device.deviceDescriptor.idVendor === parseInt(process.env.RECORDER_SCARLETT_VID,10) && 
        device.deviceDescriptor.idProduct === parseInt(process.env.RECORDER_SCARLETT_PID,10)) {
      debug('about to close scarlett recorder');
      await recorders.scarlett.close() //stop the recorder
      sendStatus('remove', {channel: 'scarlett'});
      delete recorders.scarlett;
      debug('closed scarlett recorder');
    } else if (device.deviceDescriptor.idVendor === parseInt(process.env.RECORDER_YETI_VID,10) && 
        device.deviceDescriptor.idProduct === parseInt(process.env.RECORDER_YETI_PID,10)) {
      debug('about to close yeti recorder');
      await recorders.yeti.close();
      sendStatus('remove', {channel: 'yeti'});
      delete recorders.yeti;
      debug('closed yeti recorder');
    }
  }
  async function close(usb) {
  // My process has received a SIGINT signal

    if (server) {
      logger('app', 'Starting Server ShutDown Sequence');
      try {
        const tmp = server;
        server = null;
        if (statusTimer !== 0) clearInterval(statusTimer);
        debug('Tell our subscribers we are shutting down');
        sendStatus('close',{});
        debug('Lets just stop for 1/2 second to allow our close events to be send out')
        await new Promise(resolve => setTimeout(() => resolve(),500));
        debug('about to stop monitoring udev events')
        usb.off('attach', usbAttach);
        usb.off('detach', usbDetach);
        if (recorders.scarlett !== undefined) {
          //need to shut off the recording smoothly
          debug('stopping scarlett');
          await recorders.scarlett.close();
          debug('scarlett stopped');
          delete recorders.scarlett;
        }
        if (recorders.yeti !== undefined) {
          debug('stopping yeti');
          await recorders.yeti.close();
          debug('yeti stopped');
          delete recorders.yeti;
        }
        debug('Lets just stop for 1/2 second to allow our volume subscriber shutdown messages to go out')
        await new Promise(resolve => setTimeout(() => resolve(),500));
        debug('About to close Web Server');
        tmp.destroy();
        logger('app', 'Recorder Server ShutDown');
      } catch (err) {
        logger('error', `Trying to close caused error:${err}`);
      }
    }
    process.exit(0);
  }
  if (!module.parent) {
    //running as a script, so call startUp
    debug('Startup as main script');
    startUp(http, Router, enableDestroy, logger, Recorder, usb);
    process.on('SIGINT', () => close(usb));
  }
  module.exports = {
    startUp: startUp,
    close: close
  };
})();
