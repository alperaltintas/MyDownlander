# MyDownloader

A modern, cross-platform desktop video downloader built with **Tauri v2**, **React**, and **yt-dlp**.

![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Video & Audio Downloads** — Download from YouTube and 1000+ supported sites via yt-dlp
- **Format Selection** — Choose between Best Quality, MP4 (1080p/720p/480p), MP3, or M4A
- **Live Progress Bar** — Real-time download progress with speed and ETA
- **Pause & Resume** — Pause downloads and resume from where you left off
- **Clipboard Paste** — One-click paste button to quickly grab URLs from your clipboard
- **Auto Title Fetch** — Automatically retrieves the video title when a URL is added
- **Click to Open** — Click on completed downloads to open the file directly
- **Cookie Authentication** — Use browser cookies to access members-only or private content
- **Multilingual UI** — Full support for English, Turkish, French, Italian, and Spanish
- **Dark & Light Themes** — Glass-morphism UI with macOS vibrancy and a purple-to-pink gradient in dark mode
- **yt-dlp Self-Update** — Update the bundled yt-dlp engine from within the app
- **System Tray** — Runs quietly in the background with a tray icon

## Screenshots

> *Coming soon*

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Rust + Tauri v2 |
| Frontend | React + TypeScript |
| Video Engine | yt-dlp (bundled binary) |
| State Management | Zustand |
| Animations | Framer Motion |
| Styling | CSS Variables + Glass UI |

## Getting Started

### Prerequisites

- [Rust](https://rustup.rs/) (latest stable)
- [Node.js](https://nodejs.org/) v20+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed on your system

### Development

```bash
# Clone the repository
git clone https://github.com/alperaltintas/MyDownlander.git
cd MyDownlander

# Install frontend dependencies
npm install

# Run in development mode
npm run tauri dev
```

### Build

```bash
# macOS (Apple Silicon)
cargo tauri build --target aarch64-apple-darwin

# Linux
cargo tauri build
```

## Project Structure

```
├── src/                  # React frontend
│   ├── components/       # UI components
│   ├── hooks/            # Custom React hooks
│   ├── store/            # Zustand state stores
│   ├── i18n/             # Translations (EN, TR, FR, IT, ES)
│   └── styles/           # CSS (themes, glass effects)
│
├── src-tauri/            # Rust backend
│   ├── src/
│   │   ├── lib.rs        # App entry, commands, vibrancy
│   │   ├── downloader.rs # yt-dlp process management
│   │   ├── cookie_manager.rs
│   │   ├── updater.rs    # yt-dlp self-update
│   │   └── tray.rs       # System tray
│   └── capabilities/     # Tauri permissions
│
└── .github/workflows/    # CI/CD for macOS & Linux
```

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
