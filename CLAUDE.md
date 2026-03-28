# CLAUDE.md — MyDownloader

> This file is the single source of truth for Claude Code.
> Read it fully before taking any action in this project.

---

## Project Identity

- **Name:** MyDownloader
- **Type:** Cross-platform desktop app (macOS + Linux)
- **Framework:** Tauri v2 (Rust backend + React/TypeScript frontend)
- **Video Engine:** yt-dlp (bundled binary)
- **Full spec:** See `MYDOWNLOADER_SPEC.md` in project root

---

## Commands You Must Know

### `init` — Bootstrap the project from scratch
When the user says **"init"**, **"initialize"**, or **"bootstrap the project"**, execute these steps in order:

```
1. Check prerequisites: rust, node (v20+), yt-dlp
2. Run: npm create tauri-app@latest . -- --template react-ts
3. Install frontend deps (see list below)
4. Add Rust crates to src-tauri/Cargo.toml (see list below)
5. Apply window vibrancy patch to src-tauri/src/main.rs
6. Create file structure under src/ and src-tauri/src/
7. Create .github/workflows/ CI files
8. Confirm: run `npm run tauri dev` and report status
```

After init completes, update this CLAUDE.md:
- Set `## Init Status` → `DONE`
- Fill in the `## Discovered Paths` section with actual paths

### `build mac` — Build macOS release
```
cargo tauri build --target aarch64-apple-darwin
```
Output: `src-tauri/target/release/bundle/dmg/*.dmg`

### `build linux` — Build Linux Flatpak
```
cargo tauri build
flatpak-builder --force-clean build-dir packaging/flatpak/io.github.mydownloader.yml
```

### `add feature <name>` — Scaffold a new feature
Create the Rust command in `src-tauri/src/`, register it in `main.rs`, create the React component in `src/components/`.

### `update yt-dlp` — Update the bundled yt-dlp binary
Fetch latest release from `https://github.com/yt-dlp/yt-dlp/releases/latest` for both platforms and place in `src-tauri/binaries/`.

---

## Architecture Rules (Never Break These)

- **All yt-dlp calls happen in Rust** — never call yt-dlp from JavaScript/TypeScript
- **No secrets in frontend** — cookies, credentials go through Tauri commands only
- **Platform branches in Rust** — use `#[cfg(target_os = "macos")]` / `#[cfg(target_os = "linux")]`
- **CSS variables for all colors** — never hardcode hex in components
- **Zustand for global state** — no prop drilling for download queue
- **Tauri events for progress** — use `app.emit_all("download-progress", payload)` from Rust

---

## File Map

```
mydownloader/
├── CLAUDE.md                        ← you are here
├── MYDOWNLOADER_SPEC.md             ← full project spec, read when in doubt
│
├── src-tauri/
│   ├── src/
│   │   ├── main.rs                  ← app entry, vibrancy setup, command registration
│   │   ├── downloader.rs            ← yt-dlp invocation, progress streaming
│   │   ├── cookie_manager.rs        ← browser cookie extraction, file import
│   │   ├── updater.rs               ← yt-dlp binary self-update
│   │   └── tray.rs                  ← system tray
│   ├── binaries/
│   │   ├── yt-dlp-aarch64-apple-darwin   ← macOS ARM binary
│   │   ├── yt-dlp-x86_64-apple-darwin    ← macOS Intel binary
│   │   └── yt-dlp-x86_64-unknown-linux   ← Linux binary
│   ├── Cargo.toml
│   └── tauri.conf.json
│
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── UrlInput.tsx             ← URL paste + clipboard detect
│   │   ├── DownloadQueue.tsx        ← live queue with progress bars
│   │   ├── FormatPicker.tsx         ← quality selector
│   │   ├── ThemeToggle.tsx          ← light/dark switch
│   │   ├── AuthModal.tsx            ← cookie/login UI
│   │   └── SettingsPanel.tsx        ← preferences drawer
│   ├── hooks/
│   │   ├── useClipboard.ts
│   │   └── useDownloads.ts
│   ├── store/downloads.ts           ← Zustand store
│   └── styles/
│       ├── globals.css              ← CSS variables (light + dark tokens)
│       └── glass.css                ← translucency utility classes
│
├── packaging/
│   ├── homebrew/mydownloader.rb
│   └── flatpak/io.github.mydownloader.yml
│
└── .github/workflows/
    ├── build-macos.yml
    └── build-linux.yml
```

---

## Dependency Lists

### Rust (`src-tauri/Cargo.toml`)
```toml
[dependencies]
tauri = { version = "2", features = ["tray-icon", "shell-open"] }
tauri-plugin-shell = "2"
tauri-plugin-notification = "2"
tauri-plugin-dialog = "2"
tauri-plugin-fs = "2"
window-vibrancy = "0.5"
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
```

### Node (`package.json`)
```
react, react-dom
@tauri-apps/api v2
@tauri-apps/plugin-shell
@tauri-apps/plugin-dialog
zustand
framer-motion
clsx
tailwind-merge
tailwindcss, autoprefixer, vite
```

---

## Platform-Specific Behavior

### macOS
- Window vibrancy: `NSVisualEffectMaterial::HudWindow`
- Traffic light buttons: keep native (do NOT hide them)
- Cookie source default: Safari → Chrome → Firefox
- Code sign + notarize before distribution

### Linux
- Window blur: CSS `backdrop-filter: blur(20px)` — works only with compositors (KWin, Mutter)
- Custom titlebar (native one is hidden)
- Cookie source default: Firefox → Chrome
- Flatpak permissions required: `--filesystem=home:rw`, `--share=network`

---

## Design Tokens

All components MUST use these CSS variables. Do not hardcode colors.

| Token | Light | Dark |
|-------|-------|------|
| `--bg-glass` | `rgba(255,255,255,0.55)` | `rgba(20,20,25,0.60)` |
| `--surface` | `rgba(255,255,255,0.75)` | `rgba(30,30,38,0.80)` |
| `--text-primary` | `#1a1a1a` | `#f0f0f0` |
| `--text-secondary` | `#6b6b6b` | `#9a9a9a` |
| `--accent` | `#0066ff` | `#4d9bff` |
| `--border` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.08)` |

Theme class applied to `<html>`: `class="light"` or `class="dark"`

---

## Key Tauri Patterns

### Rust → Frontend event (progress streaming)
```rust
app_handle.emit_all("download-progress", ProgressPayload {
    id: download_id,
    percent: 78.5,
    speed: "3.2 MiB/s".into(),
    eta: "00:12".into(),
}).unwrap();
```

### Frontend → Rust command call
```typescript
import { invoke } from '@tauri-apps/api/core';

const result = await invoke<string>('start_download', {
  url,
  format: selectedFormat,
  outputPath,
});
```

### Listening to progress in React
```typescript
import { listen } from '@tauri-apps/api/event';

useEffect(() => {
  const unlisten = listen<ProgressPayload>('download-progress', (event) => {
    updateDownload(event.payload.id, event.payload);
  });
  return () => { unlisten.then(f => f()); };
}, []);
```

---

## Init Status

> Claude Code: update this section after running `init`

- [x] Prerequisites checked
- [x] Tauri project created
- [x] Frontend deps installed
- [x] Rust crates added
- [x] Vibrancy patch applied (programmatic via window-vibrancy in lib.rs)
- [x] File structure created
- [x] CI workflows created
- [x] `npm run tauri dev` passes (first build ~473 crates, no errors)

---

## Discovered Paths

> Claude Code: fill these in after `init` completes

- Tauri config: `src-tauri/tauri.conf.json`
- yt-dlp binary dir: `src-tauri/binaries/`
- Bundle output (macOS): `src-tauri/target/aarch64-apple-darwin/release/bundle/dmg/*.dmg`
- Bundle output (Linux): `src-tauri/target/release/bundle/deb/*.deb`

---

## Coding Style

- **Rust:** `clippy` clean, no `unwrap()` in production paths (use `?` operator)
- **TypeScript:** strict mode on, no `any`
- **Components:** functional only, no class components
- **Commits:** conventional commits (`feat:`, `fix:`, `chore:`)
- **Branch:** `main` is always releasable; features on `feat/<name>`

---

## When You Are Unsure

1. Read `MYDOWNLOADER_SPEC.md` — it has the full feature list and rationale
2. Prefer Rust for anything touching the filesystem or subprocess
3. Prefer TypeScript/React for anything the user sees
4. Ask before modifying `tauri.conf.json` — wrong values break signing
