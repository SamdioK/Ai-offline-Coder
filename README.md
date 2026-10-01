# CodeForge Offline — browser MVP foundation

This workspace contains a dependency-free JavaScript browser prototype. `index.html` is the entry page and `index.js` builds the IDE shell and its local services without a build system.

## Implemented in this workspace

- Dark/light IDE layout with explorer, tabs, editor, assistant, terminal, problems and settings panels.
- Local project creation and saved-project switching, plus browser folder import.
- File create, rename and delete operations with relative-path checks.
- Browser-local persistence routed through a workspace backend adapter, with a two-second autosave option and JSON project backup export. The current adapter uses `localStorage`; it can be replaced by IndexedDB or a desktop database without changing workspace UI logic.
- JavaScript execution in a sandboxed iframe with a restrictive Content Security Policy and a three-second timeout.
- Basic run-error reporting and a clearly identified development AI mock behind an `AIProvider` abstraction.
- Browser-reported online/offline status; core UI and local storage do not depend on network access.

## Mobile and offline app-shell support

The workspace now adapts to narrow touch screens with a mobile view bar for Code, Files, Assistant, and Panel. `manifest.webmanifest`, `icon.svg`, and `service-worker.js` provide a progressive web app shell for compatible browsers. When served from HTTPS (or localhost), the service worker caches the app shell so it can reopen offline after its first successful load. Project data continues to use browser local storage.

This is a browser-based PWA, not a native Android APK. Installation and offline caching depend on the browser and hosting environment; opening the files directly as `file://` does not enable service workers. The current execution service runs JavaScript only.

## Important scope and safety notes

This is **not** the requested native Tauri/React/TypeScript/Monaco/SQLite application. The integrated backend in this version is a client-side workspace persistence adapter backed by browser `localStorage`; there is no server API, shared database, or hosted backend process. Projects are imported into browser storage; edits do not write back into the selected source folder. Browser storage can be cleared or run out of space, so export backups of important work. The editor is a plain text area without syntax highlighting. Only JavaScript can run, using browser APIs rather than Node.js; Python, TypeScript compilation, a real terminal, tests, Git and SQLite are not implemented. The assistant is rule-based and does not use an AI model.

The iframe runner is a convenience for trusted snippets, not a hardened operating-system sandbox. Do not use it to execute untrusted code. This prototype has not been validated as a production security boundary or through an automated test suite.

A native v0.1 implementation needs a Tauri-capable project scaffold and local filesystem/database services; those dependencies and runtime are not present in this workspace.
