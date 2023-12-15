// import fs from 'fs';
const fs = require('fs');

const folderToWatch = '../gofer-engine/src/examples';

fs.watch(folderToWatch, () => {
  const files = fs.readdirSync('../gofer-engine/src/examples');
  files.forEach((file) => {
    const fileParts = file.split('.');
    const ext = fileParts.pop();
    const content = `\`\`\`${ext} title="/src/${file}"\n${fs.readFileSync(`../gofer-engine/src/examples/${file}`, 'utf8')}\`\`\`\n`;
  
    fs.writeFileSync(`../docs/static/code/${file}.md`, content, { flag: 'w' });
  });
});

