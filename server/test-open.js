const path = require('path');

const sqlite3 = require('sqlite3');
const {open} = require('sqlite');



(async () => {

    console.log('starting');
    const start = Date.now()

    let db;
    try {
        db = await open({
            filename: path.resolve(__dirname, '..', 'data/football.db'),
            mode: sqlite3.OPEN_READWRITE,
            driver: sqlite3.Database 
        });
     } catch(e) {
        console.log(e);
    } finally {
        if (db) db.close();
    }
    const end = Date.now();
    console.log('finished in ', end - start, ' milliseconds');

