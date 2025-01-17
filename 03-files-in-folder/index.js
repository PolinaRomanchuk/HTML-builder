const { readdir } = require('node:fs/promises');
const { stat } = require('node:fs/promises');

const path = require('node:path');
const folderPath = path.join(__dirname, 'secret-folder');

async function findFiles(folder) {
  const files = await readdir(folder, { withFileTypes: true });
  for (const file of files) {
    if (file.isFile()) {
      const filePath = path.join(folder, file.name);
      const fileStats = await stat(filePath);
      const fileExtension = path.extname(file.name).slice(1);
      const fileSize = fileStats.size;
      console.log(`${filePath} - ${fileExtension} - ${fileSize} bytes`);
    }
  }
}

findFiles(folderPath);
