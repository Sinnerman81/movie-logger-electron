const path = require('path');
const fs = require('fs');

// Remove characters invalid on Windows and many filesystems. Also trim trailing dots and spaces.
function sanitizeFilename(name) {
    if (!name) return 'untitled';
    // Replace control chars and reserved characters
    let s = String(name).replace(/[<>:"/\\|?*\x00-\x1F]/g, '');
    // Trim spaces
    s = s.trim();
    // Remove trailing dots and spaces (Windows doesn't allow filenames that end with space or dot)
    while (s.endsWith('.') || s.endsWith(' ')) s = s.slice(0, -1);
    // Remove leading dots and spaces (avoid hidden files like .name on Windows)
    while (s.startsWith('.') || s.startsWith(' ')) s = s.slice(1);
    if (!s) return 'untitled';
    return s;
}

// If filename exists in dir, append " (1)", " (2)", ... before extension
function generateUniqueFilename(dir, filename) {
    const base = path.basename(filename, path.extname(filename));
    const ext = path.extname(filename) || '';
    let candidate = base + ext;
    let counter = 1;
    while (fs.existsSync(path.join(dir, candidate))) {
        candidate = `${base} (${counter})${ext}`;
        counter += 1;
        if (counter > 10000) break; // safety
    }
    return candidate;
}

module.exports = {
    sanitizeFilename,
    generateUniqueFilename,
};
