(async () => {
  const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname, '../server/db-init', 'football.env') });

  const fs = require('fs').promises;
  let db;
  let s;
  try {
    const outputFileName = path.resolve(__dirname, 'logo.sql');
    const dbOpen = require('../server/utils/database');
    await fs.unlink(outputFileName).catch(() => { });
    db = await dbOpen();
    await db.exec('BEGIN TRANSACTION');
    const teams = await db.all('SELECT tid, logo FROM team ORDER BY tid');
    for(const team of teams) {
      const msg = `INSERT INTO team(tid, name, logo, confid, divid) VALUES('${team.tid}', '${team.name}', '${team.logo}', '${team.confid}', '${team.divid}');`;
      await fs.appendFile(outputFileName, `${msg}\n`);
    }
    await db.exec('COMMIT');
    await db.close();
  } catch(e) {
    console.log(e);
    if (db) await db.close();
  }

})();