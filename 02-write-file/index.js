const path = require('path');
const readline = require('readline');
const fs = require('node:fs');
const process = require('node:process');

const filePath = path.join(__dirname, 'text.txt');
const writableStream = fs.createWriteStream(filePath, { flags: 'a' });
const rl = readline.createInterface(process.stdin, process.stdout);
console.log('Hi! You can write something here. Enter exit or Ctrl+C to close');

rl.on('line', (text) => {
  if (text.trim().toLowerCase() === 'exit') {
    rl.close();
  } else {
    writableStream.write(`${text} `);
  }
});

process.on('exit', () => {
  console.log('By!');
  writableStream.end();
});
