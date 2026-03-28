import { motion, AnimatePresence } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { useDownloadsStore, type Download } from "../store/downloads";
import { useT } from "../hooks/useT";

function StatusBadge({ status }: { status: Download["status"] }) {
  const t = useT();
  const map: Record<Download["status"], { color: string; label: string }> = {
    queued: { color: "var(--text-secondary)", label: t.statusQueued },
    downloading: { color: "var(--accent)", label: t.statusDownloading },
    done: { color: "#22c55e", label: t.statusDone },
    error: { color: "#ef4444", label: t.statusError },
    cancelled: { color: "var(--text-secondary)", label: t.statusCancelled },
    paused: { color: "#f59e0b", label: t.statusPaused },
  };
  const { color, label } = map[status];
  return <span style={{ color, fontSize: 12, fontWeight: 600 }}>{label}</span>;
}

function DownloadRow({ d }: { d: Download }) {
  const removeDownload = useDownloadsStore((s) => s.removeDownload);
  const updateDownload = useDownloadsStore((s) => s.updateDownload);
  const t = useT();

  const handlePause = async () => {
    await invoke("pause_download", { id: d.id });
    updateDownload(d.id, { status: "paused" });
  };

  const handleResume = async () => {
    await invoke("resume_download", { id: d.id });
    updateDownload(d.id, { status: "downloading" });
  };

  const handleOpenFile = async () => {
    if (d.filePath) {
      await invoke("open_file", { path: d.filePath });
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className="glass-sm"
      style={{ padding: "12px 16px", marginBottom: 8, display: "flex", flexDirection: "column", gap: 6 }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span
          onClick={d.status === "done" && d.filePath ? handleOpenFile : undefined}
          title={d.status === "done" && d.filePath ? t.openFile : undefined}
          style={{
            color: "var(--text-primary)",
            fontSize: 14,
            fontWeight: 500,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "60%",
            cursor: d.status === "done" && d.filePath ? "pointer" : "default",
            textDecoration: d.status === "done" && d.filePath ? "underline" : "none",
            textDecorationColor: "var(--accent)",
          }}
        >
          {d.title || d.url}
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <StatusBadge status={d.status} />
          {d.status === "downloading" && (
            <button className="btn-ghost" style={{ padding: "2px 8px", fontSize: 11 }} onClick={handlePause}>
              ⏸ {t.pause}
            </button>
          )}
          {d.status === "paused" && (
            <button className="btn-ghost" style={{ padding: "2px 8px", fontSize: 11 }} onClick={handleResume}>
              ▶ {t.resume}
            </button>
          )}
          <button className="btn-ghost" style={{ padding: "2px 8px", fontSize: 12 }} onClick={() => removeDownload(d.id)}>
            ✕
          </button>
        </div>
      </div>

      {(d.status === "downloading" || d.status === "paused") && (
        <div>
          <div style={{ height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
            <motion.div
              className={d.status === "paused" ? undefined : "progress-fill"}
              style={{
                height: "100%",
                background: d.status === "paused" ? "#f59e0b" : undefined,
                borderRadius: 2,
              }}
              animate={{ width: `${d.percent}%` }}
              transition={{ ease: "easeOut", duration: 0.4 }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "var(--text-secondary)" }}>
            <span>{d.percent.toFixed(1)}%</span>
            {d.status === "downloading" && <span>{d.speed} · ETA {d.eta}</span>}
          </div>
        </div>
      )}

      {d.status === "error" && d.error && (
        <span style={{ fontSize: 12, color: "#ef4444" }}>{d.error}</span>
      )}
    </motion.div>
  );
}

export function DownloadQueue() {
  const downloads = useDownloadsStore((s) => s.downloads);
  const clearDone = useDownloadsStore((s) => s.clearDone);
  const t = useT();

  if (downloads.length === 0) {
    return (
      <div style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: 40, fontSize: 14 }}>
        {t.queueEmpty}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
          {t.items(downloads.length)}
        </span>
        <button className="btn-ghost" style={{ fontSize: 12 }} onClick={clearDone}>
          {t.clearFinished}
        </button>
      </div>
      <AnimatePresence mode="popLayout">
        {downloads.map((d) => <DownloadRow key={d.id} d={d} />)}
      </AnimatePresence>
    </div>
  );
}
