import fs from 'fs';
import path from 'path';

const srcPath = 'src/app';
const destPath = 'test-data/src-copy';
// Grab the target directory argument passed from package.json (./out-tsc)
const outputDir = process.argv[2] || './out-tsc';

// 1. Mirror the source assets
function copyFolderRecursiveSync(from, to) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }

  const elements = fs.readdirSync(from);
  for (const element of elements) {
    const sourceElement = path.join(from, element);
    const destElement = path.join(to, element);
    const stat = fs.statSync(sourceElement);

    if (stat.isDirectory()) {
      copyFolderRecursiveSync(sourceElement, destElement);
    } else if (stat.isFile()) {
      const targetName = element.endsWith('.ts') ? element.replace('.ts', '.mts') : element;
      fs.copyFileSync(sourceElement, path.join(to, targetName));
    }
  }
}

// 2. Rename compiled files to .mjs inside the build output folder
function renameFilesRecursively(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      renameFilesRecursively(fullPath);
    } else if (stat.isFile() && file.endsWith('.js')) {
      const newPath = fullPath.slice(0, -3) + '.mjs';
      fs.renameSync(fullPath, newPath);
    }
  }
}

try {
  // Clear old source copy artifacts
  if (fs.existsSync(destPath)) {
    fs.rmSync(destPath, { recursive: true, force: true });
  }

  // Execute operations
  copyFolderRecursiveSync(srcPath, destPath);
  console.log(`Successfully mirrored all source assets from "${srcPath}" into "${destPath}"`);

  renameFilesRecursively(path.resolve(outputDir));
  console.log(`Successfully converted all compilation targets to strict .mjs files inside: ${outputDir}`);
} catch (err) {
  console.error('Operation failed:', err);
  process.exit(1);
}
