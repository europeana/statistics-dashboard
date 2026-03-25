/** Script to copy files */

import * as fs from 'fs';

const filePaths = [
  'src/app/_models/api.ts',
  'src/app/_models/ihash.ts',
  'src/app/_models/targets.ts',
  'src/app/_data/countries-member-state-codes.ts'
];

const destPath = 'test-data/src-copy';

if (!fs.existsSync(destPath)){
  fs.mkdirSync(destPath);
}

filePaths.forEach((path)=> {
  const fileName = path.split('/').pop().replace('.ts', '.mts');

  fs.copyFile(path, `${destPath}/${fileName}`, (err) => {
    if (err) {
      throw err;
    }
    console.log(`copied "${path}" to "test-data/${fileName}"`);
  });

});
