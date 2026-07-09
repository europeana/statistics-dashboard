import fs from 'fs';
import path from 'path';

const destPath = 'test-data/src-copy';

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
      fs.copyFileSync(sourceElement, destElement);
    }
  }
}

try {
  if (fs.existsSync(destPath)) {
    fs.rmSync(destPath, { recursive: true, force: true });
  }

  // 1. Mirror your models and datasets flatly into the sandbox directory
  copyFolderRecursiveSync('src/app/_models', path.join(destPath, '_models'));
  copyFolderRecursiveSync('src/app/_data', path.join(destPath, '_data'));

  // 2. Generate the environments directory frame
  const mockEnvDir = path.join(destPath, 'environments');
  fs.mkdirSync(mockEnvDir, { recursive: true });

  // 3. Drop clean mock environment files that require NO deep relative app path lookups
  const mockEnvContent = `export const environment = { production: false };\nexport const cookieConsentConfig = {};\nexport const maintenanceConfig = {};\nexport const externalLinks = {};`;

  fs.writeFileSync(path.join(mockEnvDir, 'environment.ts'), mockEnvContent);
  fs.writeFileSync(path.join(mockEnvDir, 'eu-cm-settings.ts'), mockEnvContent);
  fs.writeFileSync(path.join(mockEnvDir, 'maintenance-settings.ts'), mockEnvContent);

  console.log(`Successfully generated a clean, isolated mock testing layer inside "${destPath}"`);
} catch (err) {
  console.error('Operation failed:', err);
  process.exit(1);
}
