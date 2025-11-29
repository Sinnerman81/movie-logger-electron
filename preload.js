// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Expose a function to prompt the user to set the vault path
    setVaultPath: () => ipcRenderer.invoke('set-vault-path'),

    // Expose a function to check the current status of the vault path
    checkVaultPath: () => ipcRenderer.invoke('check-vault-path'),

    // Fetch movie data using the main process (API key not exposed to renderer)
    fetchMovie: (title) => ipcRenderer.invoke('fetch-movie', title),

    // Save movie entry (main process will assemble markdown and write file)
    saveMovie: (movie) => ipcRenderer.invoke('save-movie', movie),

    // Store OMDb API key securely in app data
    setOmdbKey: (key) => ipcRenderer.invoke('set-omdb-key', key),
});

// We don't expose fs or other sensitive Node modules directly.
// The renderer calls 'writeMarkdownFile', and the main process uses fs.