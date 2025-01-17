const { join } = require('node:path');
const { readdir, mkdir, copyFile, rm } = require('node:fs/promises');

const newFolderPath = join(__dirname, 'files-copy');
const oldFolderPath = join(__dirname, 'files');

async function createDirectory() {
  await rm(newFolderPath, { recursive: true, force: true });
  await mkdir(newFolderPath, { recursive: true });
}

async function findFiles() {
  return await readdir(oldFolderPath, { withFileTypes: true });
}

async function copyFiles() {
  const files = await findFiles();
  for (const file of files) {
    if (file.isFile()) {
      const sourcePath = join(oldFolderPath, file.name);
      const destinationPath = join(newFolderPath, file.name);
      await copyFile(sourcePath, destinationPath);
    }
  }
}

async function start() {
  await createDirectory();
  await copyFiles();
}

start();
