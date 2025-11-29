// main.js

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const OBSIDIAN_PATH = path.join(app.getPath('userData'), 'obsidian-movie-vault-path.txt');
const OMDB_KEY_FILE = path.join(app.getPath('userData'), 'omdb_api_key.txt');

const { sanitizeFilename, generateUniqueFilename } = require('./utils/file-utils');

// --- 1. Window Management ---
let mainWindow = null;
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            // Load the preload script before running other scripts in the renderer
            preload: path.join(__dirname, 'preload.js'),
            // Security Best Practice: Disable Node integration in the renderer
            nodeIntegration: false,
            contextIsolation: true 
        }
    });

    // Load the HTML file for the application GUI
    mainWindow.loadFile('index.html');

    // Open the DevTools only in development (optional)
    // mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});


// --- 2. IPC Communication and File Writing Logic ---

/**
 * Handles the request to write the Markdown file directly to the Obsidian vault.
 */
ipcMain.handle('write-markdown-file', async (event, { filename, content }) => {
    try {
        // Read the stored vault path
        if (!fs.existsSync(OBSIDIAN_PATH)) {
            return { success: false, message: 'Vault path not configured. Please select the vault folder first.' };
        }
        const vaultPath = fs.readFileSync(OBSIDIAN_PATH, 'utf-8').trim();
        // Sanitize filename and ensure no invalid filesystem characters
        const safeName = sanitizeFilename(filename);

        // Generate a unique filename (avoid collisions by appending " (1)", " (2)", ...)
        const uniqueName = generateUniqueFilename(vaultPath, safeName);
        const fullPath = path.join(vaultPath, uniqueName);

        // Synchronously write the file to the user's system
        fs.writeFileSync(fullPath, content);

        return { success: true, message: `Successfully logged movie to: ${fullPath}` };
    } catch (error) {
        console.error('File Write Error:', error);
        return { success: false, message: `Failed to write file: ${error.message}` };
    }
});


/**
 * Allows the user to select the Obsidian movie folder and stores the path.
 */
ipcMain.handle('set-vault-path', async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Select Your Obsidian Movie Database Folder'
    });

    if (canceled) {
        return { success: false, path: null };
    }

    const selectedPath = filePaths[0];
    
    // Store the path for later use
    fs.writeFileSync(OBSIDIAN_PATH, selectedPath);

    return { success: true, path: selectedPath };
});


// Returns the stored vault path if configured
ipcMain.handle('check-vault-path', async () => {
    try {
        if (!fs.existsSync(OBSIDIAN_PATH)) return { configured: false, path: null };
        const vaultPath = fs.readFileSync(OBSIDIAN_PATH, 'utf-8').trim();
        if (!vaultPath) return { configured: false, path: null };
        return { configured: true, path: vaultPath };
    } catch (err) {
        console.error('check-vault-path error', err);
        return { configured: false, path: null };
    }
});


// Fetch movie details from OMDb using an API key stored in env or in a file in userData
ipcMain.handle('fetch-movie', async (event, title) => {
    try {
        // Prefer environment variable
        let apiKey = process.env.OMDB_API_KEY;
        if (!apiKey && fs.existsSync(OMDB_KEY_FILE)) {
            apiKey = fs.readFileSync(OMDB_KEY_FILE, 'utf-8').trim();
        }

        if (!apiKey) return { success: false, error: 'OMDb API key not configured. Set OMDB_API_KEY or place a key in the app data folder.' };

        const url = new URL('https://www.omdbapi.com/');
        url.searchParams.set('apikey', apiKey);
        url.searchParams.set('t', title);

        // Use built-in fetch if available
        let res;
        if (typeof fetch === 'function') {
            res = await fetch(url.toString());
            const json = await res.json();
            return { success: true, data: json };
        }

        // Fallback to https request
        const https = require('https');
        const body = await new Promise((resolve, reject) => {
            https.get(url.toString(), (r) => {
                let data = '';
                r.on('data', (chunk) => (data += chunk));
                r.on('end', () => resolve(data));
            }).on('error', reject);
        });
        return { success: true, data: JSON.parse(body) };
    } catch (err) {
        console.error('fetch-movie error', err);
        return { success: false, error: err.message };
    }
});


/**
 * Save a movie entry: build YAML + Markdown and write to vault.
 * Expects an object with movie fields and user metadata.
 */
ipcMain.handle('save-movie', async (event, movie) => {
    try {
        if (!fs.existsSync(OBSIDIAN_PATH)) {
            return { success: false, message: 'Vault path not configured.' };
        }
        const vaultPath = fs.readFileSync(OBSIDIAN_PATH, 'utf-8').trim();

        const q = (s) => (s === undefined || s === null) ? '""' : JSON.stringify(String(s));

        const yamlFrontmatter = `---\n` +
            `title: ${q(movie.Title)}\n` +
            `year: ${q(movie.Year)}\n` +
            `mpaa_rating: ${q(movie.Rated)}\n` +
            `runtime: ${q(movie.Runtime)}\n` +
            `genre: ${q(movie.Genre)}\n` +
            `main_stars: ${q(movie.Actors)}\n` +
            `your_rating: ${q(movie.userRating)}\n` +
            `media_type: ${q(movie.mediaType)}\n` +
            `tags:\n${(movie.tags || []).map(t => `  - ${q(t)}`).join('\n')}\n` +
            `---`;

        const posterEmbed = (movie.Poster && movie.Poster !== 'N/A') ? `![Poster Image](${movie.Poster})` : '';

        const markdownContent = `${yamlFrontmatter}\n\n${posterEmbed}\n\n## Summary\n${movie.Plot || ''}\n\n---\n*Logged via MovieLoggerApp on ${new Date().toLocaleDateString()}*\n`;

        const filenameRaw = `${movie.Title} (${movie.Year}).md`;
        const safeName = sanitizeFilename(filenameRaw);
        const fullPath = path.join(vaultPath, safeName);

        // If file exists, ask user what to do
        if (fs.existsSync(fullPath)) {
            const { response } = await dialog.showMessageBox(mainWindow, {
                type: 'question',
                buttons: ['Overwrite', 'Create copy', 'Cancel'],
                defaultId: 2,
                cancelId: 2,
                title: 'File already exists',
                message: `A file named "${safeName}" already exists in the vault.`,
                detail: 'Choose whether to overwrite, create a copy, or cancel the save.'
            });

            if (response === 2) return { success: false, message: 'Save canceled by user.' };
            if (response === 1) {
                // create copy
                const uniqueName = generateUniqueFilename(vaultPath, safeName);
                fs.writeFileSync(path.join(vaultPath, uniqueName), markdownContent);
                return { success: true, message: `Saved as: ${path.join(vaultPath, uniqueName)}` };
            }
            // response === 0 -> overwrite
            fs.writeFileSync(fullPath, markdownContent);
            return { success: true, message: `Overwrote existing file: ${fullPath}` };
        }

        // No collision: write straight
        fs.writeFileSync(fullPath, markdownContent);
        return { success: true, message: `Successfully logged movie to: ${fullPath}` };
    } catch (err) {
        console.error('save-movie error', err);
        return { success: false, message: err.message };
    }
});


// Allow setting the OMDb API key from renderer
ipcMain.handle('set-omdb-key', async (event, key) => {
    try {
        if (!key) return { success: false, message: 'No key provided' };
        fs.writeFileSync(OMDB_KEY_FILE, String(key).trim());
        return { success: true };
    } catch (err) {
        console.error('set-omdb-key error', err);
        return { success: false, message: err.message };
    }
});