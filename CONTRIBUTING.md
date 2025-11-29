# Contributing to Obsidian Movie Logger

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing.

## Code of Conduct

Please be respectful and constructive in all interactions with other contributors.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```
   git clone https://github.com/YOUR-USERNAME/movie-logger-electron.git
   cd movie-logger-electron
   ```
3. **Create a branch** for your changes:
   ```
   git checkout -b feature/your-feature-name
   ```

## Development Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Set your OMDb API key:
   ```powershell
   $env:OMDB_API_KEY = 'your_key_here'
   ```

3. Start the app:
   ```
   npm start
   ```

4. Run tests:
   ```
   npm test
   ```

## Making Changes

- Follow the existing code style
- Comment complex logic
- Keep commits atomic and meaningful
- Update the README if you add features
- Add tests for new functionality

## Reporting Bugs

Use the [Bug Report](https://github.com/Sinnerman81/movie-logger-electron/issues/new?template=bug_report.md) template. Include:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version)

## Suggesting Features

Use the [Feature Request](https://github.com/Sinnerman81/movie-logger-electron/issues/new?template=feature_request.md) template. Include:
- Problem description
- Proposed solution
- Acceptance criteria

## Submitting Changes

1. **Commit your changes** with a clear message:
   ```
   git commit -m "Add feature: description of changes"
   ```

2. **Push to your fork**:
   ```
   git push origin feature/your-feature-name
   ```

3. **Create a Pull Request** on GitHub using the PR template

4. **Respond to feedback** and make requested changes

## Pull Request Guidelines

- One feature per PR (or one bug fix)
- Use the provided PR template
- Include tests for new code
- Update documentation as needed
- Ensure CI/CD checks pass

## Project Structure

```
movie-logger-electron/
├── index.html          # Renderer UI (dark theme)
├── main.js             # Main process (IPC handlers, file I/O)
├── preload.js          # Preload script (secure API exposure)
├── package.json        # Dependencies
├── README.md           # Project documentation
├── utils/
│   └── file-utils.js   # Filename sanitization & collision handling
├── test/
│   └── run-file-utils-tests.js  # Unit tests
└── .github/
    ├── workflows/      # GitHub Actions CI/CD
    └── ISSUE_TEMPLATE/ # Issue templates
```

## Security

- Never expose the OMDb API key to the renderer process
- Sanitize filenames before writing
- Use `contextIsolation: true` in Electron config
- Validate user input before processing

## Questions?

Feel free to open an issue with your question or contact the maintainers.

Thank you for contributing! 🎬
