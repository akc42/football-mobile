(async () => {
  const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname, '../server/db-init', 'football.env') });

  const fs = require('fs').promises;

  // function to encode file data to base64 encoded string
  async function base64_encode(file) {
    // read binary data
    const bitmap = await fs.readFile(file);
    // convert binary data to base64 encoded string
    return Buffer.from(bitmap).toString('base64');
  }
  let db;
  let s;
  try {
    const outputFileName = path.resolve(__dirname, 'logo.txt');
    const dbOpen = require('../server/utils/database');
    await fs.unlink(outputFileName).catch(() => { });
    db = await dbOpen();
    await db.exec('BEGIN TRANSACTION');
    const teams = await db.all('SELECT tid, logo FROM team ORDER BY tid');
    for(const team of teams) {
      const b64 = await base64_encode(path.resolve(__dirname,'../client/images', team.logo));
      const msg = `UPDATE Team SET logo = '${b64}' WHERE tid = '${team.tid}'`;
      await fs.appendFile(outputFileName, `${msg}\n`);
    }

    await db.exec('COMMIT');
    await db.close();
  } catch(e) {
    console.log(e);
    if (db) await db.close();
  }

})();