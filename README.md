# 🎥 Obsidian Movie Logger (Electron)

A desktop application that integrates with the OMDb API to search for movies and automatically log them to your Obsidian vault with rich metadata, YAML frontmatter, and poster images.

## Features

- **Movie Search**: Search for movies using the OMDb API with title autocomplete.
- **Rich Metadata**: Automatically captures genre, runtime, MPAA rating, actors, and plot summary.
- **Customizable Logging**: Add your personal rating (1-10) and media format (DVD, Blu-ray, streaming services, etc.).
- **Smart Tagging**: Auto-generates tags from movie actors and genres for Obsidian organization.
- **File Collision Handling**: Choose to overwrite, create a copy, or cancel when a file already exists.
- **Secure API Key Storage**: OMDb API key is stored locally and never exposed to the renderer process.
- **YAML Frontmatter**: Properly quoted YAML for seamless Obsidian integration.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm
- An OMDb API key (get one for free at [omdbapi.com](https://www.omdbapi.com/apikey.aspx))

### Setup

1. Clone or extract this repository.
2. Install dependencies:
   ```
   npm install
   ```

## Configuration

### Setting the OMDb API Key

You can set your OMDb API key in one of two ways:

#### Option 1: Environment Variable (Recommended)

Set the `OMDB_API_KEY` environment variable before starting the app:

**PowerShell:**
```powershell
$env:OMDB_API_KEY = 'your_api_key_here'
npm start
```

**Command Prompt:**
```cmd
set OMDB_API_KEY=your_api_key_here
npm start
```

**Bash/Linux/macOS:**
```bash
export OMDB_API_KEY='your_api_key_here'
npm start
```

#### Option 2: In-App Configuration

1. Click the **"Set OMDb API Key"** button in the app.
2. Enter your API key in the modal dialog.
3. The key will be stored securely in your app data folder.

### Setting the Obsidian Vault Path

1. Click the **"Select Obsidian Movie Folder"** button.
2. Choose the folder where you want movie notes to be saved (typically `VaultName/Movies` or similar).
3. The path is stored locally and persists across app restarts.

## Usage

1. **Start the app:**
   ```
   npm start
   ```

2. **Search for a movie:**
   - Enter a movie title (e.g., "Inception")
   - Click "Search" or press Enter
   - The app fetches movie details from OMDb

3. **Review movie details:**
   - View genre, runtime, actors, MPAA rating, and plot summary
   - Movie poster is displayed (if available)

4. **Log the movie:**
   - Select your personal rating (1-10)
   - Choose the media format (DVD, Blu-ray, Apple TV, etc.)
   - Click "Log & Save Movie Directly to Obsidian"

5. **Handle duplicates:**
   - If a file for that movie already exists, choose one of:
     - **Overwrite**: Replace the existing entry
     - **Create Copy**: Save as "Movie Title (1).md", "Movie Title (2).md", etc.
     - **Cancel**: Don't save

## Generated File Format

Each movie entry is saved as a Markdown file with the following structure:

```yaml
---
title: "Inception"
year: "2010"
mpaa_rating: "PG-13"
runtime: "148 min"
genre: "Action, Adventure, Sci-Fi"
main_stars: "Leonardo DiCaprio, Marion Cotillard, Tom Hardy"
your_rating: "9/10"
media_type: "Blu-ray"
tags:
  - "leonardo_dicaprio"
  - "marion_cotillard"
  - "action"
  - "sci-fi"
---

![Poster Image](https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTUzNw@@._V1_SX300.jpg)

## Summary
A skilled thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.

---
*Logged via MovieLoggerApp on 11/29/2025*
```

## Testing

Run the included unit tests:

```
npm test
```

This validates filename sanitization and collision-handling logic.

## Architecture

- **Main Process** (`main.js`): Handles IPC communication, file I/O, API calls, and stores sensitive data (OMDb API key).
- **Preload Script** (`preload.js`): Exposes safe IPC methods to the renderer process.
- **Renderer** (`Index.html`): User-facing UI built with Tailwind CSS and vanilla JavaScript.
- **Utilities** (`utils/file-utils.js`): Filename sanitization and collision avoidance helpers.

### Security Features

- **API Key Protection**: API key is never exposed to the renderer process; all OMDb requests happen in the main process.
- **No Node Integration**: Renderer process has `nodeIntegration: false` and uses `contextIsolation: true`.
- **Safe File Operations**: Filenames are sanitized to prevent invalid filesystem characters.
- **YAML Escaping**: All values in YAML frontmatter are properly quoted to prevent syntax errors.

## Troubleshooting

### "OMDb API key not configured"

- Ensure you've set the `OMDB_API_KEY` environment variable or used the "Set OMDb API Key" button in the app.
- Restart the app after setting the key.

### "Vault path not configured"

- Click "Select Obsidian Movie Folder" and choose a valid directory.
- Ensure you have write permissions to the selected folder.

### Movie not found

- Double-check the movie title spelling.
- Try searching by year (e.g., "Inception 2010").
- The OMDb API may not have the movie if it's very new or obscure.

## Contributing

Feel free to open issues or submit pull requests to improve the app!

## License

ISC

## Support

For issues with the OMDb API itself, visit [omdbapi.com](https://www.omdbapi.com/).

---

Happy logging! 🎬
