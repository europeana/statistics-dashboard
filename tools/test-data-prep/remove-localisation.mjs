/**
 * Script to remove localisation flags and metadata from code statements
 * and fix module resolution paths to allow the ci data server to parse the mjs
 */
import * as path from 'path';
import * as fs from 'fs';

const args = process.argv.slice(2);
const dirArg = args[0];

if (!dirArg) {
  console.log('Please supply an argument for the directory (e.g., ./out-tsc)');
  process.exit(1);
} else {
  const listDir = (dir, fileList = []) => {
    if (!fs.existsSync(dir)) return fileList;

    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        fileList = listDir(fullPath, fileList);
      } else {
        // Target both standard compiled .js and natively generated .mjs files
        if (/\.m?js$/.test(file)) {
          fileList.push(fullPath);
        }
      }
    });
    return fileList;
  };

  const targetPath = path.resolve(dirArg);
  const files = listDir(targetPath);

  console.log(`Will remove localisation and align extensions for ${files.length} files in ${dirArg}`);

  files.forEach((file) => {
    try {
      let data = fs.readFileSync(file, 'utf8');
      let hasChanges = false;

      // Remove Angular's $localize tags entirely
      if (/\$localize\s*`/.test(data)) {
        data = data.replace(/\$localize\s*`\s*:[^:]*:/g, '`');
        hasChanges = true;
      }

      // Rewrite internal relative import/export paths pointing to .js to use .mjs instead
      // This maps patterns like: from './api.js' or import('./api.js')
      if (/(from|import)\s+(['"])\.\.?\/.*?\.js\2/.test(data)) {
        data = data.replace(/(from|import)\s+(['"])(\.\.?\/.*?)\.js\2/g, '$1 $2$3.mjs$2');
        hasChanges = true;
      }

      // Save adjustments back to disk if updates occurred
      if (hasChanges) {
        fs.writeFileSync(file, data, 'utf8');
      }

      // Rename physical .js files on disk to .mjs for absolute ESM runtime compliance
      if (file.endsWith('.js')) {
        const newPath = file.slice(0, -3) + '.mjs';

        // If an .mjs file already exists here, clear it before renaming to avoid conflicts
        if (fs.existsSync(newPath)) {
          fs.unlinkSync(newPath);
        }

        fs.renameSync(file, newPath);
      }
    } catch (err) {
      console.error(`Error processing file ${file}:`, err);
    }
  });

  console.log('Post-processing build transformations complete.');
}
