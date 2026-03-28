# MyDownloader — Project Specification

> A modern, cross-platform video downloader built with Tauri, featuring a translucent native UI and powered by yt-dlp.

---

## Overview

**MyDownloader** is a desktop application that allows users to download videos from virtually any website by simply pasting a URL. It is designed to look and feel native on both macOS and Linux, combining macOS-style visual polish with Linux-grade performance.

---

## Target Platforms

| Platform | Distribution Channel | UI Backend | Blur/Transparency |
|----------|---------------------|------------|-------------------|
| macOS (12+) | Homebrew Cask | WKWebView | NSVisualEffectView (Vibrancy) |
| Linux (x86_64) | Flathub (Flatpak) | WebKitGTK | CSS `backdrop-filter` + compositor |

Both platforms share the same Rust/TypeScript codebase. Platform-specific adaptations are isolated in dedicated modules.

---

## Technology Stack

### Core Framework
- **[Tauri](https://tauri.app/) v2** — Rust-based desktop runtime with a web frontend
- Chosen over Electron for its dramatically smaller bundle size (~5 MB vs ~80 MB), lower RAM usage, and native OS integration

### Frontend
- **React 18** + **TypeScript**
- **Tailwind CSS** — utility-first styling
- **Framer Motion** — smooth animations and transitions
- Custom design system with CSS variables for theming

### Backend (Rust)
- **yt-dlp** — video extraction engine (called via `std::process::Command`)
- **window-vibrancy** crate — macOS `NSVisualEffectView` blur
- **tauri-plugin-shell** — secure subprocess management
- **serde / serde_json** — data serialization between frontend and backend

### Video Engine
- **[yt-dlp](https://github.com/yt-dlp/yt-dlp)** (latest binary, bundled or auto-updated)
  - Supports 1000+ sites out of the box
  - Active fork of youtube-dl with faster updates and bug fixes
  - Handles age-restricted and authentication-required content

---

## Features

### Core Functionality
- **URL Paste & Download** — paste any video URL and start downloading immediately
- **Format Selection** — choose video quality (4K, 1080p, 720p, audio-only, etc.) before downloading
- **Download Queue** — manage multiple simultaneous downloads with progress bars
- **Output Directory Picker** — choose where files are saved per-download or globally
- **Download History** — searchable log of past downloads with re-download option

### Site Compatibility
- Standard platforms: YouTube, Vimeo, Twitter/X, Instagram, TikTok, Reddit, Twitch
- Adult/age-restricted platforms via:
  - `--cookies-from-browser` (reads session cookies from Chrome, Firefox, Safari)
  - Manual cookie file import (Netscape format)
  - Username/password authentication fields (per-site)
  - `--no-check-certificate` for sites with non-standard TLS
- Any site supported by yt-dlp extractors (~1000+)

### UI / UX
- **Translucent Window** — frosted glass effect on both macOS and Linux (compositor required)
- **Light / Dark Theme Toggle** — instant switch with a single button; respects system preference on launch
- **Minimalist Interface** — clean, distraction-free layout inspired by native macOS apps
- **Drag & Drop URL** — drag a URL from a browser into the app window
- **Clipboard Auto-Detection** — app detects a copied URL when focused and offers to paste automatically
- **System Tray Integration** — minimize to tray; show download completion notifications
- **Keyboard Shortcuts** — `⌘V` / `Ctrl+V` to paste URL, `⌘,` / `Ctrl+,` for preferences

### Performance
- Downloads run as native Rust subprocesses — no JavaScript overhead
- Concurrent downloads limited only by user preference (default: 3 parallel)
- Progress streamed in real time via Tauri event system

---

## UI Design Specification

### Visual Style
- **Aesthetic:** Refined translucent glass — think macOS Sequoia + a touch of visionOS depth
- **Window chrome:** Frameless on macOS (traffic lights preserved), custom titlebar on Linux
- **Background:** Blurred, semi-transparent panel (`NSVisualEffectMaterial::HudWindow` on macOS; `backdrop-filter: blur(20px)` on Linux)
- **Font:** Display — *Instrument Serif* or *Canela*; UI — *Geist* or *DM Sans*
- **Radius:** 12px for cards, 8px for inputs, 20px for the main window
- **Shadows:** Soft, layered shadows (no harsh drop shadows)

### Color Tokens (CSS Variables)

```css
/* Light Theme */
--bg-glass:        rgba(255, 255, 255, 0.55);
--surface:         rgba(255, 255, 255, 0.75);
--text-primary:    #1a1a1a;
--text-secondary:  #6b6b6b;
--accent:          #0066ff;
--accent-hover:    #0050cc;
--border:          rgba(0, 0, 0, 0.08);

/* Dark Theme */
--bg-glass:        rgba(20, 20, 25, 0.60);
--surface:         rgba(30, 30, 38, 0.80);
--text-primary:    #f0f0f0;
--text-secondary:  #9a9a9a;
--accent:          #4d9bff;
--accent-hover:    #70b1ff;
--border:          rgba(255, 255, 255, 0.08);
```

### Layout

```
┌─────────────────────────────────────────────┐
│  ● ● ●   MyDownloader          🌙  ⚙        │  ← Titlebar
├─────────────────────────────────────────────┤
│                                             │
│   ┌─────────────────────────────────────┐  │
│   │  🔗  Paste a video URL here...   ⏎  │  │  ← URL Input
│   └─────────────────────────────────────┘  │
│                                             │
│   [ Video ]  [ Audio ]  [ Custom ]          │  ← Format Tabs
│                                             │
│   ─────────── Download Queue ────────────   │
│   ▶ youtube.com/...    ████████░░  78%  ✕  │
│   ✓ twitter.com/...    Completed  3.2 MB    │
│   ⟳ vimeo.com/...      Waiting...           │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Project Structure

```
mydownloader/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs              # App bootstrap, window setup, vibrancy
│   │   ├── downloader.rs        # yt-dlp invocation & progress streaming
│   │   ├── cookie_manager.rs    # Browser cookie extraction & file import
│   │   ├── updater.rs           # yt-dlp binary auto-updater
│   │   └── tray.rs              # System tray logic
│   ├── icons/                   # App icons (all sizes)
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── UrlInput.tsx         # URL paste field with auto-detect
│   │   ├── DownloadQueue.tsx    # Live download list with progress
│   │   ├── FormatPicker.tsx     # Quality/format selector
│   │   ├── ThemeToggle.tsx      # Light/dark switch
│   │   ├── AuthModal.tsx        # Site login / cookie import
│   │   └── SettingsPanel.tsx    # Preferences drawer
│   ├── hooks/
│   │   ├── useClipboard.ts      # Clipboard polling
│   │   └── useDownloads.ts      # Download state management
│   ├── store/
│   │   └── downloads.ts         # Zustand store
│   └── styles/
│       ├── globals.css          # CSS variables, resets
│       └── glass.css            # Translucency utilities
│
├── .github/
│   └── workflows/
│       ├── build-macos.yml      # macOS .dmg + Homebrew tap update
│       └── build-linux.yml      # Flatpak bundle + Flathub submission
│
├── packaging/
│   ├── homebrew/
│   │   └── mydownloader.rb      # Homebrew Cask formula
│   └── flatpak/
│       └── io.github.mydownloader.yml  # Flatpak manifest
│
└── README.md
```

---

## Authentication & Cookie Support

To support age-restricted and login-required sites, MyDownloader provides three methods:

### 1. Browser Cookie Extraction
Reads cookies directly from the user's installed browser session.
```
--cookies-from-browser chrome
--cookies-from-browser firefox
--cookies-from-browser safari   # macOS only
```
The user selects their browser in Settings; no manual login required.

### 2. Cookie File Import
Users can import a `cookies.txt` file in Netscape format (exported via browser extension).

### 3. Username / Password
For sites that support credential login (e.g., Patreon, some adult platforms), a per-URL auth modal collects credentials and passes them to yt-dlp securely. Credentials are stored in the system keychain (macOS Keychain / libsecret on Linux).

---

## Distribution

### macOS — Homebrew Cask

```ruby
# Formula: mydownloader.rb
cask "mydownloader" do
  version "1.0.0"
  sha256 "..."
  url "https://github.com/yourusername/mydownloader/releases/download/v#{version}/MyDownloader_#{version}_aarch64.dmg"
  name "MyDownloader"
  desc "Modern, translucent video downloader powered by yt-dlp"
  homepage "https://github.com/yourusername/mydownloader"
  app "MyDownloader.app"
end
```

Install command:
```bash
brew install --cask mydownloader
```

### Linux — Flathub (Flatpak)

App ID: `io.github.yourusername.MyDownloader`

```bash
flatpak install flathub io.github.yourusername.MyDownloader
```

The Flatpak sandbox grants:
- `--filesystem=home:rw` — read/write access to home directory for downloads
- `--share=network` — internet access for yt-dlp
- `--talk-name=org.freedesktop.Notifications` — desktop notifications

### GitHub Releases
Both `.dmg` (macOS) and `.flatpak` (Linux) binaries are attached to each GitHub release via GitHub Actions.

---

## CI/CD — GitHub Actions

### macOS Build (`build-macos.yml`)
- Runs on `macos-latest`
- Installs Rust + Node.js
- Bundles yt-dlp binary (universal2)
- Signs with Apple Developer certificate (code signing)
- Notarizes with Apple Notary Service
- Uploads `.dmg` to GitHub Releases
- Updates Homebrew tap formula

### Linux Build (`build-linux.yml`)
- Runs on `ubuntu-22.04`
- Installs Tauri Linux dependencies (`webkit2gtk`, `libgtk-3`, etc.)
- Builds Flatpak bundle using `flatpak-builder`
- Runs Flathub validation checks
- Uploads `.flatpak` to GitHub Releases

---

## Rust Dependencies (`Cargo.toml`)

```toml
[dependencies]
tauri = { version = "2", features = ["tray-icon", "shell-open"] }
tauri-plugin-shell = "2"
tauri-plugin-notification = "2"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
window-vibrancy = "0.5"     # macOS NSVisualEffectView + Windows Mica
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
```

---

## Frontend Dependencies (`package.json`)

```json
{
  "dependencies": {
    "react": "^18",
    "react-dom": "^18",
    "@tauri-apps/api": "^2",
    "@tauri-apps/plugin-shell": "^2",
    "@tauri-apps/plugin-dialog": "^2",
    "zustand": "^4",
    "framer-motion": "^11",
    "clsx": "^2",
    "tailwind-merge": "^2"
  },
  "devDependencies": {
    "typescript": "^5",
    "vite": "^5",
    "@vitejs/plugin-react": "^4",
    "tailwindcss": "^3",
    "autoprefixer": "^10"
  }
}
```

---

## Development Roadmap

### Phase 1 — macOS MVP
- [ ] Tauri project scaffold with React + TypeScript
- [ ] Window vibrancy (macOS blur) via `window-vibrancy` crate
- [ ] URL input with clipboard auto-detection
- [ ] yt-dlp integration with real-time progress streaming
- [ ] Format picker (video/audio quality)
- [ ] Light/dark theme toggle
- [ ] Download queue with cancel/retry
- [ ] Output directory selection
- [ ] Homebrew Cask formula

### Phase 2 — Linux Port
- [ ] WebKitGTK blur via CSS `backdrop-filter` + compositor hint
- [ ] GTK-compatible window chrome (custom titlebar)
- [ ] Flatpak manifest + Flathub submission
- [ ] Desktop notifications (libnotify)

### Phase 3 — Advanced Features
- [ ] Browser cookie extraction UI
- [ ] Cookie file import
- [ ] Per-site credentials stored in system keychain
- [ ] yt-dlp auto-update mechanism
- [ ] Subtitle download support
- [ ] Playlist / channel batch download
- [ ] Bandwidth throttle option
- [ ] Download scheduling

### Phase 4 — Polish & Release
- [ ] App icon design (all sizes, macOS Big Sur style)
- [ ] GitHub Actions CI/CD pipelines
- [ ] Code signing & notarization (macOS)
- [ ] Flathub review process
- [ ] Documentation site (GitHub Pages)

---

## Legal & Ethical Notes

- MyDownloader is a general-purpose tool; it does not endorse copyright infringement.
- Users are solely responsible for complying with the Terms of Service of the websites they access.
- The cookie/authentication features are provided to enable access to content the user is legitimately entitled to (e.g., purchased content, personal subscriptions).
- No content is hosted, cached, or transmitted by the application developer.

---

## Quick Start (Development)

```bash
# Prerequisites: Rust, Node.js 20+, yt-dlp in PATH

git clone https://github.com/yourusername/mydownloader.git
cd mydownloader

npm install
npm run tauri dev
```

For macOS vibrancy to work, run on a physical Mac (not a VM).

---

*Specification version: 1.0 — March 2026*
