// import fs from 'fs';
const fs = require('fs');

// if option watch is passed, watch the folder for changes
const watch = process.argv.includes('watch')

const folderToWatch = '../gofer-engine/src/examples';

const processFiles = () => {
  const files = fs.readdirSync('../gofer-engine/src/examples');
  files.forEach((file) => {
    const fileParts = file.split('.');
    const ext = fileParts.pop();
    const content = `\`\`\`${ext} title="/src/${file}"\n${fs.readFileSync(`../gofer-engine/src/examples/${file}`, 'utf8')}\`\`\`\n`;
  
    fs.writeFileSync(`../docs/static/code/${file}.md`, content, { flag: 'w' });
  });
}

if (watch) {
  fs.watch(folderToWatch, () => {
    processFiles();
  });
} else {
  processFiles();
}

