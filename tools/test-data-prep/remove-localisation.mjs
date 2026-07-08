/** Script to remove localisation flags and metadata from code statements in order
/*  to allow the ci data server to parse the mjs
*/
import * as path from 'path';
import * as fs from 'fs';

const dir = process.argv.slice(2);

if (dir.length === 0) {
  console.log('please supply an argument for the directory');
} else {
  const listDir = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        fileList = listDir(path.join(dir, file), fileList);
      } else {
        if (/\.m?js$/.test(file)) {
          fileList.push(path.join(dir, file));
        }
      }
    });
    return fileList;
  };

  const files = listDir(`./${dir}`);

  console.log(`Will remove localisation from ${files.length} files in ${dir}`);

  files.forEach((file) => {
    try {
      const data = fs.readFileSync(file, 'utf8');

      let result = data.replace(/\$localize\s*`\s*:[^:]*:/g, '`');
      // Rewrite internal relative imports/exports pointing to .js to use .mjs instead
      // This matches patterns like: from './api.js' or import('./api.js')
      result = result.replace(/(from|import)\s+(['"])(\.\.?\/.*?)\.js\2/g, '$1 $2$3.mjs$2');

      fs.writeFileSync(file, result, 'utf8');
    } catch (err) {
      console.error(`Error processing file ${file}:`, err);
    }
  });
}
