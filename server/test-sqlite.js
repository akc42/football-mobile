const path = require('path');
require('dotenv').config({path: path.resolve(__dirname,'.env')});

const {performance} = require('perf_hooks');

const sqlite3 = require('sqlite3');
const {open} = require('sqlite');

//input parameters for this data
const uid = 4;
const guest = false;
const name = 'alan';
const email = 'alan@chandlerfamily.org.uk';
let rid;

(async () => {

    console.log('starting');
    const start = Date.now()

    let db;
    try {
        db = await open({
            filename: path.resolve(__dirname, '..', process.env.FOOTBALL_DB),
            driver: sqlite3.Database 
        });
        await db.exec('PRAGMA foreign_keys = ON');

        const partUpdate = db.run(`UPDATE participant SET name = ?, email = ?, is_guest = ?, last_logon = strftime('%s','now'),
                                    admin_experience=1, is_global_admin = 1 WHERE uid = ?`, name, email, 0, uid);

        if (partUpdate.changes  === 0) {
            console.log('no update to participant occurred would normally do an insert here');
            return;
        }
        await db.exec('BEGIN TRANSACTION');  //do the whole thing as one big transaction

        let s = await db.prepare('SELECT value FROM settings WHERE name = ?');
        const {value : max_round_display} = await s.get('max_round_display');
        const {value: forum_path} = await s.get('home_url');
        const {value: cache_age} = await s.get('cache_age');
        console.log ('max_round_display ',max_round_display);
        console.log('forum_path ', forum_path);
        console.log('cache_age ', cache_age);
        const messages = {};
        ({value: messages.noquestion} = await s.get('msgnoquestion'));
        ({value: messages.register} = await s.get('msgregister'));
        console.log('Messages :', messages);
        const {value:dcid} = await s.get('default_competition');
        await s.finalize();
        if (dcid === 0) {
            console.log('Competition not open yet');
            
        } else {
            const cid = dcid;
            let row = await db.get('SELECT * FROM Competition c JOIN participant u ON c.administrator = u.uid WHERE cid = ?', cid);
            let admin = false;
            if (row.administrator === uid ) {
                admin = true;
                await db.run('UPDATE participant SET admin_experience = 1 WHERE uid = ?', uid);
            }
            const gap = row.gap;
            const playoff_deadline = row.pp_deadline;
            const registration_open = row.open === 1;
            const approval_required = row.guest_approval === 1;
            const condition = row.condition;
            const admName = row.name;
            const competitionTitle = row.description;
            const competitionCache = row.results_cache;
            const competitionCacheDate = row.cache_store_date;
            row = await db.get('SELECT * FROM registration WHERE uid = ? AND cid = ?',uid,cid);
            let signedup;
            let registered;
            if (row) {
                signedup = true;
                if (approval_required && row.approved !== 1 && guest && !admin) {
                    registered = false;
                } else {
                    registered = true;
                }
            } else {
                signedup = false;
                registered = false;
            }
            row = null;
            const registration_allowed = (registration_open && !signedup);
            let roundData;
            if (rid !== undefined) {
                console.log('getting round data for a specific round, ', rid);
                roundData = await db.get('SELECT * FROM round WHERE open = 1 AND cid = ? AND rid = ?', cid,rid);
            } else {
                console.log('get round data for the highest rid')
                roundData = await db.get('SELECT * FROM round WHERE cid = ? AND open = 1 ORDER BY rid DESC LIMIT 1', cid);
            }
            if (roundData !== undefined) {
                rid = roundData.rid;
            } else {
                rid = 0;
            }
            let rounds = await db.all('SELECT rid,name FROM round WHERE open = 1 AND cid = ? and rid <> ? ORDER BY rid DESC', cid,rid);
            let maxrid = rid;
            for( const round of rounds) {
                if (round.rid > maxrid) maxrid = round.rid;
            }
            rounds = null;
            console.log('read list of rounds and worked out maxrid as ', maxrid);
 
            console.log('read the competition list for drop down menu - ', competitions.length, ' entries plus cid ', cid);
            //summary.inc (no attempt to use cache for this test)
            let usedCache = false;
            let compData
            if (rid != 0) {
                console.log('reading competition summary data that could make cache from');
                compData = await db.all(`SELECT r.rid AS rid, r.name AS rname,r.score AS score,t.uid AS uid,t.name AS name,
                                    t.rscore AS rscore,t.pscore AS pscore,(t.rscore + t.pscore) AS tscore FROM (
                    SELECT r.cid,u.uid,u.name AS name,sum(rs.score) AS rscore,p.pscore
                    FROM participant u JOIN registration r USING (uid)
                    JOIN round_score rs USING (cid,uid)
                    JOIN (
                        SELECT cid,uid,sum(score) as pscore
                        FROM playoff_score GROUP BY cid,uid
                        ) p USING (cid,uid)
                    GROUP BY r.cid,u.uid,u.name,p.pscore
                    ) t
                    JOIN (
                        SELECT cid,uid,rounds.name, rounds.rid,score
                    FROM round_score rs JOIN (
                        SELECT cid,rid,name FROM round
                        WHERE cid = ? AND open = 1 AND rid <= ?
                        ORDER BY rid DESC LIMIT 20
                    ) AS rounds USING (cid,rid)
                    ) r USING (cid,uid)
                    ORDER BY (pscore + rscore) DESC, t.name COLLATE NOCASE,rid DESC`, cid, rid);
            } else {
                console.log('No rounds, so setting all to zero');
                compData = db.all(`SELECT 0 As score,u.uid AS uid, u.name AS name, 0 AS pscore, 0 AS rscore, 0 AS tscore
                    FROM participant u JOIN registration r USING (uid) WHERE cid = ? ORDER BY u.name COLLATE NOCASE`, cid);
            }
            let lastuid = 0;
            let first_user = true;
            const summary = {round: [], user: []};
            let user;
            let round;
            for (row of compData) {
                if (row.uid !== lastuid) {
                    if (lastuid !== 0) {
                        summary.user.push(user);
                        first_user = false;
                    }
                    user = {
                        uid: row.uid,
                        name: row.name,
                        pscore: row.pscore,
                        rscore: row.rscore,
                        tscore: row.tscore,
                        scores: []
                    };
                    lastuid = row.uid;
                }
                user.scores.push(row.score);
                if (first_user && rid !== 0) {
                    round = {
                        rid: row.rid,
                        name: row.name
                    };
                    summary.round.push(round);
                }  
            }
            compData = null;
            if(rid === maxrid) {
                console.log('storing competition cache');
            //We can store the result in the cache.
                await db.run(`UPDATE competition SET results_cache = ?, cache_store_date = (strftime('%s','now')) WHERE cid = ?`, JSON.stringify(summary), cid);
            }
        

            if (registration_allowed) {
                //registration.inc
                console.log('allowing registrations - not implementing this right now');
            } else {
            
                //picks.inc (no attempt to use the cache)
                console.log('about to read picks for this round without using cache');
                const picks = await db.all(`SELECT name, u.uid AS uid , pscore, oscore, mscore,bscore,score, opid, comment,admin_made,submit_time
                                        FROM round_score r JOIN participant u USING (uid) 
                                        LEFT JOIN option_pick p USING (cid,rid,uid)
                                        WHERE r.cid = ? AND r.rid = ? ORDER BY score DESC,u.name;`, cid, rid);
                picks.matches = await db.all(`SELECT aid,hid,ascore,hscore,combined_score,match_time,comment,underdog FROM match 
                                        WHERE cid = ? AND rid = ? AND open = 1 ORDER BY match_time, aid`, cid, rid);
                let p = await db.all(`SELECT p.uid AS uid,p.aid AS aid,pid, over_selected, p.comment AS comment, pscore, oscore,admin_made,submit_time
                                        FROM match_score m LEFT JOIN pick p USING (cid,rid,aid,uid) WHERE m.cid = ? AND m.rid = ? `, cid, rid);
                picks.picks = {}
                for (const pick of p) {
                    const uid2 = pick.uid;
                    delete pick.uid;
                    const aid = pick.aid;
                    delete pick.aid;
                    if (picks.picks[uid2] === undefined) picks.picks[uid2] = {};
                    picks.picks[uid2][aid] = pick;
                }
                p = null;
                console.log('update round cache with pick data');
                await db.run(`UPDATE round SET results_cache = ?, cache_store_date = (strftime('%s','now')) WHERE cid = ? AND rid = ?`, JSON.stringify(picks), cid, rid);
                //playoff.inc
                    //team.inc
                        //confdiv.inc
                        console.log('read conference and div data');
                        const confs = {};
                        const divs = {};
                        let confData = await db.all(`SELECT * FROM conference ORDER BY confid`);
                        for (const conf of confData) {
                            confs[conf.confid] = conf.name;
                        }
                        console.log('confs :', confs);
                        confData = null;
                        let divData = await db.all(`SELECT * FROM division ORDER BY divid`);
                        for (const div of divData) {
                            divs[div.divid] = div.name;
                        }
                        console.log('divs :', divs);
                        divData = null;

                    const teams = {};
                    const sizes = {};
                    for (const conf in confs) {
                        teams[conf] = {};
                        sizes[conf] = {};
                        for (const div in divs) {
                            sizes[conf][div] = 0;
                        }
                    }

                    console.log('read team data');
                    let teamData = await db.all(`SELECT *  FROM team_in_competition t JOIN team USING (tid) WHERE t.cid = ? ORDER BY confid,divid,tid`, cid);
                    for (const team of teamData) {
                        const pick = {
                            tid: team.tid.trim(),
                            name: team.name,
                            logo: team.logo,
                            url: team.url,
                            mp: team.made_playoff === 1,
                            points: team.points
                        }
                        teams[team.confid][team.divid] = pick;
                        sizes[team.confid][team.divid]++;
                    }
                    console.log('teams :', teams, 'sizes :', sizes);
                    teamData = null;
                console.log('read playoff data');
                const playoffPicks = await db.all(`SELECT u.uid, u.name, p.tid AS tid, COALESCE(s.score,0) AS score,s.confid AS confid,p.admin_made AS admin_made,p.submit_time AS submit_time
                                FROM registration r JOIN participant u USING (uid) JOIN playoff_score s USING(cid,uid) JOIN playoff_picks p USING (cid,uid,confid)
                                WHERE r.cid = ? ORDER BY s.confid, COALESCE(s.score,0) DESC, u.name COLLATE NOCASE`, cid); 
                console.log('Play Off Picks :', playoffPicks);
                //tic.inc (no database accesses, uses team.inc above)

            }
        }
        await db.exec('COMMIT');
        
    } catch(e) {
        await db.exec('ROLLBACK');
        console.log(e);
    } finally {
        if (db) db.close();
    }
        const end = Date.now();
        console.log('finished in ', end - start, ' milliseconds');
})();
