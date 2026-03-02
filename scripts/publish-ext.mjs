import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execSync } from 'child_process';
import { createInterface } from 'readline';

const pkg = JSON.parse(readFileSync('package.json', 'utf-8'));
const currentVersion = pkg.version;

const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((resolve) => rl.question(q, resolve));

console.log(`\nCurrent version: ${currentVersion}`);
const newVersion = await ask('New version: ');

if (!newVersion || !/^\d+\.\d+\.\d+$/.test(newVersion)) {
  console.error('Invalid version format. Expected: x.y.z');
  rl.close();
  process.exit(1);
}

// Update package.json version
pkg.version = newVersion;
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');

// Update manifest.json version
const manifest = JSON.parse(readFileSync('manifest.json', 'utf-8'));
manifest.version = newVersion;
writeFileSync('manifest.json', JSON.stringify(manifest, null, 2) + '\n');

console.log(`\nVersion updated: ${currentVersion} → ${newVersion}`);

// Build
console.log('Building...');
execSync('npm run build', { stdio: 'inherit' });

// Zip into releases/
mkdirSync('releases', { recursive: true });
const zipName = `pr-commentor-${newVersion}.zip`;
execSync(`cd dist && zip -r ../releases/${zipName} .`, { stdio: 'inherit' });

console.log(`\nDone! releases/${zipName}`);
rl.close();
