const { extname, join } = require('node:path');
const { readdir } = require('node:fs/promises');
const { createReadStream, createWriteStream } = require('node:fs');

const stylesFolderPath = join(__dirname, 'styles');
const bundleFilePath = join(__dirname, 'project-dist', 'bundle.css');

const writableStream = createWriteStream(bundleFilePath, { flags: 'a' });

async function findFiles() {
  const files = await readdir(stylesFolderPath, { withFileTypes: true });
  const cssFiles = [];
  for (const file of files) {
    if (file.isFile() && extname(file.name) === '.css') cssFiles.push(file);
  }
  return cssFiles;
}

async function readFiles() {
  const files = await findFiles();
  for (const file of files) {
    const filePath = join(stylesFolderPath, file.name);
    const readableStream = createReadStream(filePath);
    readableStream.pipe(writableStream, { end: false });
    await new Promise((resolve) => readableStream.on('end', resolve));
  }
}

readFiles();
