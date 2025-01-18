const { extname, join } = require('node:path');
const { readdir, mkdir, copyFile, rm } = require('node:fs/promises');
const { createReadStream, createWriteStream } = require('node:fs');
const { promises: fsPromises } = require('node:fs');

const newFolderPath = join(__dirname, 'project-dist');
const assetsFolderPath = join(__dirname, 'assets');
const templateFile = join(__dirname, 'template.html');

const stylesFolderPath = join(__dirname, 'styles');
const indexFilePath = join(__dirname, 'project-dist', 'index.html');
const stylesFilePath = join(__dirname, 'project-dist', 'style.css');

async function createDirectory() {
  await rm(newFolderPath, { recursive: true, force: true });
  await mkdir(newFolderPath, { recursive: true });
}

async function copyFilesFromAssetsFolder(srcFolder, destFolder) {
  await mkdir(destFolder, { recursive: true });

  const files = await readdir(srcFolder, { withFileTypes: true });
  for (const file of files) {
    const srcPath = join(srcFolder, file.name);
    const destPath = join(destFolder, file.name);
    if (file.isFile()) {
      await copyFile(srcPath, destPath);
    } else if (file.isDirectory()) {
      await copyFilesFromAssetsFolder(srcPath, destPath);
    }
  }
}

async function findStyleFiles(folder) {
  const files = await readdir(folder, { withFileTypes: true });
  const cssFiles = [];
  for (const file of files) {
    if (file.isFile() && extname(file.name) === '.css') cssFiles.push(file);
  }
  return cssFiles;
}

async function copyStyles() {
  const writableStreamStyles = createWriteStream(stylesFilePath, {
    flags: 'w',
  });

  const files = await findStyleFiles(stylesFolderPath);
  for (const file of files) {
    const filePath = join(stylesFolderPath, file.name);
    const readableStream = createReadStream(filePath);
    readableStream.pipe(writableStreamStyles, { end: false });
    await new Promise((resolve) => readableStream.on('end', resolve));
  }
}

async function findTags() {
  const tags = [];
  let fileData = '';
  const readableStream = createReadStream(templateFile, 'utf-8');

  await new Promise((resolve, reject) => {
    readableStream.on('data', (chunk) => {
      fileData += chunk;
    });

    readableStream.on('end', () => {
      const regex = /{{(.*?)}}/g;
      let match = [];

      while ((match = regex.exec(fileData)) !== null) {
        tags.push(match[1]);
      }
      resolve();
    });

    readableStream.on('error', (err) => {
      reject(err);
    });
  });

  return tags;
}

async function findComponentsByTag(tag) {
  const componentPath = join(__dirname, 'components', `${tag}.html`);
  const componentContent = await fsPromises.readFile(componentPath, 'utf-8');
  return componentContent;
}

async function changeTempFile() {
  const tags = await findTags();
  let fileData = '';

  const readableStream = createReadStream(templateFile, 'utf-8');
  readableStream.on('data', (chunk) => {
    fileData += chunk;
  });

  return new Promise((resolve, reject) => {
    readableStream.on('end', async () => {
      for (const tag of tags) {
        const componentContent = await findComponentsByTag(tag);
        fileData = fileData.replace(`{{${tag}}}`, componentContent);
      }

      const writableStream = createWriteStream(indexFilePath);
      writableStream.write(fileData, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

async function start() {
  await createDirectory();
  await copyStyles();
  await changeTempFile();
  await copyFilesFromAssetsFolder(
    assetsFolderPath,
    join(newFolderPath, 'assets'),
  );
}

start();
