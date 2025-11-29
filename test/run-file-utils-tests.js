const assert = require('assert');
const os = require('os');
const path = require('path');
const fs = require('fs');

const { sanitizeFilename, generateUniqueFilename } = require('../utils/file-utils');

// Basic sanitize tests
assert.strictEqual(sanitizeFilename('Movie: Title?'), 'Movie Title');
assert.strictEqual(sanitizeFilename('  .HiddenName. '), 'HiddenName');
assert.strictEqual(sanitizeFilename(''), 'untitled');

// Unique filename test: create a temp dir and files
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mvlog-'));
try {
    const fname = 'Test Movie (2020).md';
    const safe = sanitizeFilename(fname);
    const first = path.join(tmpDir, safe);
    fs.writeFileSync(first, 'ok');

    const uniq = generateUniqueFilename(tmpDir, safe);
    // Since original exists, we expect a suffix
    assert.notStrictEqual(uniq, safe);
    console.log('All file-utils tests passed');
} finally {
    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
}
