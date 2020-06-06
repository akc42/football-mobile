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
  const outputFileName = path.resolve(__dirname, 'emoticon.txt');

  await fs.unlink(outputFileName).catch(() => {});

  const directoryPath = path.resolve(__dirname, '../client/images/emoticons');
  //passsing directoryPath and callback function
  files = await fs.readdir(directoryPath);
  //listing all files using forEach
  for (const file of files) {
    const b64 = await base64_encode(path.resolve(__dirname, '../client/images/emoticons', file));
    const code = path.basename(file,'.gif');
    const msg = `INSERT INTO emoticons (code,icon) VALUES('${code}','${b64}');`;
    await fs.appendFile(outputFileName, `${msg}\n`);
  }



})();