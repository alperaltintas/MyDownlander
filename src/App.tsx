import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { UrlInput } from "./components/UrlInput";
import { DownloadQueue } from "./components/DownloadQueue";
import { ThemeToggle } from "./components/ThemeToggle";
import { AuthModal } from "./components/AuthModal";
import { SettingsPanel } from "./components/SettingsPanel";
import { useDownloadEvents } from "./hooks/useDownloads";
import { useDownloadsStore } from "./store/downloads";
import { useT } from "./hooks/useT";
import "./styles/globals.css";
import "./styles/glass.css";

export default function App() {
  const [outputPath, setOutputPath] = useState(
    () => localStorage.getItem("outputPath") ?? "~/Downloads"
  );
  const [cookieBrowser, setCookieBrowser] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const addDownload = useDownloadsStore((s) => s.addDownload);
  const updateDownload = useDownloadsStore((s) => s.updateDownload);
  const t = useT();

  useDownloadEvents();

  const handleDownload = async (url: string, format: string) => {
    const id = crypto.randomUUID();
    addDownload({
      id,
      url,
      title: url,
      format,
      status: "queued",
    });

    // Fetch title in background
    invoke<string>("get_video_title", { url }).then((title) => {
      updateDownload(id, { title });
    }).catch(() => {});

    try {
      await invoke("start_download", {
        id,
        options: {
          url,
          format,
          output_path: outputPath.replace(/^~/, ""),
          use_cookies: cookieBrowser !== null,
          cookie_browser: cookieBrowser,
        },
      });
    } catch (err) {
      updateDownload(id, { status: "error", error: String(err) });
    }
  };

  const handleOutputPath = (p: string) => {
    setOutputPath(p);
    localStorage.setItem("outputPath", p);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", padding: "0 0 24px" }}>
      <div
        data-tauri-drag-region
        style={{ height: 40, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 16, gap: 8, WebkitAppRegion: "drag" } as React.CSSProperties}
      >
        <div style={{ WebkitAppRegion: "no-drag", display: "flex", gap: 6 } as React.CSSProperties}>
          <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setAuthOpen(true)}>{t.cookiesBtn}</button>
          <button className="btn-ghost" style={{ fontSize: 12 }} onClick={() => setSettingsOpen(true)}>{t.settingsBtn}</button>
          <ThemeToggle />
        </div>
      </div>

      <div style={{ flex: 1, padding: "0 24px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 20 }}>
          {t.appTitle}
        </h1>
        <div className="glass" style={{ padding: 16, marginBottom: 24 }}>
          <UrlInput onSubmit={handleDownload} />
        </div>
        <DownloadQueue />
      </div>

      <AuthModal open={authOpen} selectedBrowser={cookieBrowser} onSelect={setCookieBrowser} onClose={() => setAuthOpen(false)} />
      <SettingsPanel open={settingsOpen} outputPath={outputPath} onOutputPath={handleOutputPath} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
