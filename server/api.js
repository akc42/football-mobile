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
  const debug = require('debug')('pas:api');
  const logger = require('../common/logger');

  class API  extends EventEmitter {
    constructor(manager) {
      super();
      //this handles all api requests.
      manager.on('api',async (path, user, params, response, next) => {
        debug('Had a request for path %s',path);
        let processor;
        if (path.substring(0,7) === 'queries') {
          processor = 'queries';
        } else {
          processor = path;
        }
        if (this.listeners(processor).length > 0) {
          if (processor === 'queries') {
            manager.incCount('queries-' + params.name);
          } else {
            manager.incCount(processor);
          }
          response.setHeader('Content-Type','application/json');
          response.statusCode = 200;
          //we pass both manager and manager.db because most api's don't user manager
          this.emit(processor, user, params, response, manager.db, manager);
        } else {
          next();
        }
      });
      //for convenience we also handle a few more just so web server doesn't need the database
      manager.on('/logon', async (params,reply) => {
        debug('Logon Request Received');
        var user = {lid: 0, logonname: params.name};
        var passGood;
        try {
          await manager.db.exec(async (connection) => {
            if (manager.adminPromise === undefined) {
              let resolver;
              let rejector;
              manager.adminPromise = new Promise((resolve, reject) => {
                resolver = resolve;
                rejector = reject;
              });
              connection.request('SELECT UserName, DisplayName FROM Admin WHERE AdminID = 0');
              await connection.execSql(async getRow => {
                let row = await getRow();
                if (row) {
                  resolver({username : row[0].value,displayname:row[1].value});
                } else {
                  rejector('Failed to read Admin Data');
                }
              });
            }
            const admin = await manager.adminPromise;
            if (params.name.toLowerCase() === admin.username.toLowerCase()) {
              debug('Admin Logon');
              user.name = admin.displayname;
              user.keys = 'A';
              user.uid = 0;
              user.lid = 0;
              user.displayName = admin.displayname;
              let sql = 'SELECT passwordsalt FROM Admin WHERE AdminID = 0';
              connection.request(sql);
              await connection.execSql(async getRow => {
                let row = await getRow();
                if (row) {
                  user.nopass = (row[0].value === null);
                } else {
                  user.nopass = false;
                }
                debug('Admin Password bypass ' + user.nopass.toString());
              });
            } else {
              debug('Normal User Logon');
              let sql = `SELECT u.UserID,PasswordSalt,FormalName,AccessKey,l.LogID,u.DisplayName FROM Users u
                LEFT JOIN UserLog l ON u.userID = l.userID AND DATEDIFF(D,l.LogDate,GETDATE()) = 0
                WHERE u.UserName = @username`;
              let request = connection.request(sql);
              request.addParameter('username',manager.db.TYPES.NVarChar,params.name);
              let count = await connection.execSql(async getRow => {
                let row = await getRow();
                if (row) {
                  user.uid = row[0].value;
                  user.name = row[2].value;
                  user.keys = (row[3].value  === null) ? '' : row[3].value;
                  user.nopass = (row[1].value === null) ;
                  user.lid = (row[4].value === null) ? 0 : row[4].value;
                  user.displayName = row[5].value;
                  debug('Found User with uid = %d and lid = %d, keys = %s',
                    user.uid, user.lid, user.keys);
                }
              });
              if (count === 0) {
                debug('Not Found User');
                // couldn't find name in database
                reply(false,false);
                return;
              }
            }
            if (!user.nopass) {
              debug('Need a Password');
              //user has a password so we must check it
              passGood = false; //assume false as we go into this
              let request = connection.request('CheckPassword');
              request.addParameter('UserID',manager.db.TYPES.Int,user.uid);
              request.addParameter('password',manager.db.TYPES.VarChar,params.password);
              await connection.callProcedure(async getRow => {
                let row = await getRow();
                if (row) {
                  //got a valid row means we have a valid password
                  passGood = true;

                }
              });
            } else {
              passGood = true;
            }
            if (!passGood) {
              debug('Not a Good Pasword');
              reply(false,true);
            } else {
              if (user.uid !== 0 && user.lid === 0) {
                let sql = `INSERT INTO UserLog(UserID,LogDate,TimeOn,UserName) OUTPUT INSERTED.logID
                VALUES(@uid,GETDATE(),GETDATE(),@username)`;
                let request = connection.request(sql);
                request.addParameter('uid',manager.db.TYPES.Int,user.uid);
                request.addParameter('username',manager.db.TYPES.NVarChar,user.displayName);
                await connection.execSql(async getRow => {
                  let row = await getRow();
                  if (row) {
                    user.lid = row[0].value;
                    debug('Users Log Entry = %d',user.lid);
                  }
                });
              }
              reply(true,user);
            }
          });
        } catch (err) {
          logger('api','Error on logon: ' + err.message);
          reply(false,false);
        }
      });

      manager.on('/logoff', async (lid,sessionid,done) => {
        debug('Logoff request received with lid = %d',lid);
        if (lid !== 0) {
          try {
            await manager.db.exec( async (connection) => {
              let sql = 'UPDATE UserLog SET TimeOff = GETDATE() WHERE logid = @logid';
              let request = connection.request(sql);
              request.addParameter('logid',manager.db.TYPES.Int,lid);
              await connection.execSql();
            });
          } catch (err) {
            logger('api', 'log off error ' + err.toString());
          }

        }
        done();
      });
    }
  }
  module.exports = API;
})();
