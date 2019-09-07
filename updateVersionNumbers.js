/**
 * Updates the Version number during a release with semantic release
 * Usage:
 * node updateVersionNumber.js <version-string>
 */

const { resolve, relative } = require('path');
const fs = require('fs');
version = process.argv[2];

// Update vss-extension.json

const file1 = resolve(__dirname, 'src', 'vss-extension.json');
const vssextension = fs.readFileSync(file1, { encoding: 'utf8' });
fs.writeFileSync(file1, vssextension.replace(/(version": ")(.*)(")/g, `$1${version}$3`), { encoding: 'utf-8' });

// Update task.json
const file2 = resolve(__dirname, 'src', 'freestyle', 'task.json');
const task = fs.readFileSync(file2, { encoding: 'utf8' });
fs.writeFileSync(
  file2,
  task
    .replace(/("Major": )(\d*)/g, `$1${version.split('.')[0]}`)
    .replace(/("Minor": )(\d*)/g, `$1${version.split('.')[1]}`)
    .replace(/("Patch": )(\d*)/g, `$1${version.split('.')[2]}`)
    .replace(/\$\{version\}/g, version),
  { encoding: 'utf-8' }
);

console.log(`Wrote version info ${version} to ${relative(resolve(__dirname, '..'), file2)}`);
