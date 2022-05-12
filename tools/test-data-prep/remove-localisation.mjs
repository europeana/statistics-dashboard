/** Script to remove localisation flags and metadata from code statements in order
/*  to allow the ci data server to parse the mjs
/*
/*  Lines like this:
/*    description: $localize`:{Metadata Tooltip}:Tier Documentation`
/*  are rewritten like so:
/*    description: `Tier Documentation`
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
        if (/\.mjs$/.test(file)) {
          fileList.push(path.join(dir, file));
        }
      }
    });
    return fileList;
  };

  const files = listDir(`./${dir}`);

  console.log(`Will remove localisation from ${files.length} files in ${dir}`);

  files.forEach((file) => {
    fs.readFile(file, 'utf8', function (err,data) {
      if (err) {
        return console.log(err);
      }
      var result = data.replace(/\$localize\s?`:(.)*:/g, '`');

      fs.writeFile(file, result, 'utf8', function (err) {
        if (err) return console.log(err);
      });
    });
  });
  console.log('(done)');
}
