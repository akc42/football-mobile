/**
@licence
    Copyright (c) 2020 Alan Chandler, all rights reserved

    This file is part of Football Mobile.

    Football Mobile is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Football Mobile is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Football Mobile.  If not, see <http://www.gnu.org/licenses/>.
*/

(function() {
  'use strict';

  const debug = require('debug')('football:api:poffpick');
  const db = require('../utils/database');

  module.exports = async function(user, cid, params, responder) {
    debug('new request from user', user.uid, 'with cid', cid, 'on behalf of uid', params.uid, 'for team', params.tid, 'make pick is', params.pick );
    /*
      This is quite a complicated affair because we need to handle both divisional winner picks
      and two lots of wildcard picks (opid=1, and opid=2) for each conference. And we might me making a pick 
      or undoing one.
      
      The logic below is self explanatory - just one comment.  If we are trying to make a pick and the divisional winner slot is
      already filled, then we check the wildcards.  If both wildcards are full, we finally try to move one of the wildcard slots
      to an unused divisional winner slot.  Only if we can't do it with one of the two of them do we finally give up.
       
    */

    const getConfDiv = db.prepare('SELECT confid, divid FROM team WHERE tid = ?');
    const getDivWin = db.prepare('SELECT tid FROM div_winner_pick WHERE cid = ? AND uid = ? AND confid = ? AND divid = ?').pluck();
    const getWildCard = db.prepare('SELECT opid FROM wildcard_pick WHERE cid = ? AND uid = ? AND confid = ? AND tid = ?').pluck();
    const getWildCards = db.prepare('SELECT opid, tid FROM wildcard_pick WHERE cid = ? AND uid = ? AND confid = ?');
    const delDivWin = db.prepare('DELETE FROM div_winner_pick WHERE cid = ? AND uid = ? AND confid = ? AND divid = ?');
    const delWild = db.prepare('DELETE FROM wildcard_pick WHERE cid = ? AND uid = ? AND confid = ? AND opid = ?');
    const setDiv = db.prepare(`INSERT INTO div_winner_pick (cid, uid, confid, divid, tid, submit_time, admin_made)   
      VALUES (?,?,?,?,?,strftime('%s','now'),?)`);
    const setWild = db.prepare(`INSERT INTO wildcard_pick (cid, uid, confid, opid, tid, submit_time, admin_made)
      VALUES (?,?,?,?,?,strftime('%s','now'),?)`);
    const swapWildToDiv = db.prepare(`INSERT INTO div_winner_pick (cid, uid, confid, divid, tid, submit_time, admin_made)
        SELECT cid, uid, confid, ? AS divid, tid, submit_time, admin_made FROM wildcard_pick WHERE cid = ? AND uid = ? AND confid = ? AND opid = ?`)
    const invalidateCompetitionCache = db.prepare('UPDATE competition SET results_cache = null WHERE cid = ?');
    const picks = db.prepare(`SELECT p.uid, p.tid, p.admin_made, p.submit_time 
        FROM playoff_picks p WHERE p.cid = ?  AND p.uid = ?`);

    db.transaction(() => {
      const { confid, divid } = getConfDiv.get(params.tid); //find the confid and divid of the team we are referencing
      const tid = getDivWin.get(cid, params.uid, confid, divid);
      let status = true;
      if (params.pick) {
        debug('Making a pick and tid found is', tid !== undefined);
        if (tid === undefined) {
          //no divisional pick yet, so we can make one
          setDiv.run(cid, params.uid, confid,divid, params.tid, user.uid === params.uid ? 0 : 1);
          
        } else {
          const opids = getWildCards.all(cid, params.uid, confid);
          if (opids.length >= 2) {
            debug('all opids used in Wildcards');
            //but I might be able to convert a wildcard into a divisional winner pick lets see
            const {confid, divid} = getConfDiv.get(opids[0].tid);
            const win1 = getDivWin.get(cid, params.uid, confid, divid);
            if (win1 === undefined) {
              debug('move wildcard 1 to div winner and use that');
              //we can use this one
              swapWildToDiv.run(divid, cid, params.uid, confid, opids[0].opid);
              delWild.run(cid, params.uid, confid, opids[0].opid);
              setWild.run(cid, params.uid, confid, opids[0].opid, params.tid, user.uid === params.uid ? 0 : 1);
            } else {
              const { confid, divid } = getConfDiv.get(opids[1].tid);
              const win2 = getDivWin.get(cid, params.uid, confid, divid);
              if (win2 === undefined) {
                debug('move wildcard 2 to div winner and use that');
                //we can use this one
                swapWildToDiv.run(divid, cid, params.uid, confid, opids[1].opid);
                delWild.run(cid, params.uid, confid, opids[1].opid);
                setWild.run(cid, params.uid, confid, opids[1].opid, params.tid, user.uid === params.uid ? 0 : 1);
              } else {
                status = false;
                debug('cannot move either wild card to a div win slot');
              }
            }        
          } else {
            let opid = 1;
            if (opids.length >= 1 && opids[0].opid === 1) opid = 2;
            debug('inserting opid', opid, 'in wildcard_pick');
            setWild.run(cid, params.uid, confid, opid, params.tid, user.uid === params.uid ? 0 : 1);
          }
        }
      } else {
        if (tid === params.tid) {
          debug('found our tid in div_winner so removing')
          delDivWin.run(cid, params.uid, confid, divid);
        } else {
          const opid = getWildCard.get(cid, params.uid, confid, params.tid);
          if (opid !== undefined) {
            debug('found out tid in wildcard_pick as opid', opid);
            delWild.run(cid,params.uid, confid, opid );
          } else {
            status = false;
            debug('Failed to find out tid');
          }
        }
      }

      if (status) {
        invalidateCompetitionCache.run(cid);
        responder.addSection('picks', picks.all(cid, params.uid));
        debug('status good and now finished');
      }
      responder.addSection('status', status);
    })();
    debug('All done');
 };
})();