const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, '../src');
const distPath = path.join(__dirname, '../dist/src');

const assetsPath = path.join('assets');

const moveArr = [
  assetsPath,
]


moveArr.forEach(async (folder) => {
  const src = path.join(srcPath, folder);
  const dist = path.join(distPath, folder);

  fs.mkdirSync(dist, { recursive: true });

  fs.readdir(src, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
      const ext = path.extname(file);
      if (ext === '.ts') {
        return;
      }
      fs.copyFile(path.join(src, file), path.join(dist, file), (err) => {
        if (err) throw err;
      });
    });
  });
});