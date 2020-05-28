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
        const ostart = Date.now();
        
        for(let i = 0; i < 100000; i++) {
            db = await open({
                filename: '/home/alan/databases/sqlite/football.db',
                driver: sqlite3.Database
            });
            await db.close();
        }
        const oend = Date.now();
        console.log('Open Test took ', oend - ostart, ' milliseconds');

        
        db = await open({
            filename: '/home/alan/databases/sqlite/football.db',
            driver: sqlite3.Database
        });
        await db.exec('PRAGMA foreign_keys = ON');
        const t1start = Date.now();
        for(let i = 0; i<100000; i++) {
            await db.exec('BEGIN TRANSACTION');
            const competitions = await db.all(`SELECT cid, name, open FROM competition ORDER BY cid DESC`);
            const { timestamp } = await db.get(`SELECT MAX(update_date) as timestamp FROM competition`);
            await db.exec('ROLLBACK');
        }
        const t1end = Date.now();
        console.log('T1 took ', t1end - t1start, ' milliseconds');
        const t2start = Date.now();
        for (let i = 0; i < 100000; i++) {
            await db.exec('BEGIN TRANSACTION');
            const competitions = await db.all(`SELECT cid, name, open FROM competition ORDER BY cid DESC`);
            const { timestamp } = await db.get(`SELECT MAX(update_date) as timestamp FROM competition`);
            await db.exec('COMMIT');
        }
        const t2end = Date.now();
        console.log('T2 took ', t2end - t2start, ' milliseconds');



    } catch(e) {
        await db.exec('ROLLBACK');
        console.log(e);
    } finally {
        if (db) db.close();
    }
        const end = Date.now();
        console.log('finished in ', end - start, ' milliseconds');
})();
