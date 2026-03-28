import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "../hooks/useT";
import { useLangStore } from "../store/language";
import { LANGUAGES, type Lang } from "../i18n";

interface Props {
  open: boolean;
  outputPath: string;
  onOutputPath: (p: string) => void;
  onClose: () => void;
}

export function SettingsPanel({ open: isOpen, outputPath, onOutputPath, onClose }: Props) {
  const [updating, setUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");
  const t = useT();
  const lang = useLangStore((s) => s.lang);
  const setLang = useLangStore((s) => s.setLang);

  const pickFolder = async () => {
    const selected = await open({ directory: true, multiple: false });
    if (typeof selected === "string") onOutputPath(selected);
  };

  const updateYtdlp = async () => {
    setUpdating(true);
    setUpdateMsg("");
    try {
      const tag = await invoke<string>("update_ytdlp");
      setUpdateMsg(`Updated to ${tag}`);
    } catch (e) {
      setUpdateMsg(`Error: ${e}`);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}
          onClick={onClose}
        >
          <motion.div
            className="glass"
            initial={{ scale: 0.93, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.93, opacity: 0 }}
            style={{ padding: 24, minWidth: 360 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: "var(--text-primary)" }}>
              {t.settingsTitle}
            </h2>

            <section style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                {t.downloadFolder}
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="text"
                  readOnly
                  value={outputPath}
                  style={{ flex: 1, padding: "8px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 13 }}
                />
                <button className="btn-ghost" onClick={pickFolder}>{t.browse}</button>
              </div>
            </section>

            <section style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                {t.ytdlpEngine}
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button className="btn-ghost" onClick={updateYtdlp} disabled={updating}>
                  {updating ? t.updating : t.updateYtdlp}
                </button>
                {updateMsg && <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{updateMsg}</span>}
              </div>
            </section>

            <section style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 8 }}>
                {t.language}
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  color: "var(--text-primary)",
                  fontSize: 14,
                  cursor: "pointer",
                  width: "100%",
                }}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>{l.flag} {l.label}</option>
                ))}
              </select>
            </section>

            <section style={{ marginBottom: 20 }}>
              <button
                className="btn-accent"
                style={{ width: "100%" }}
                onClick={() => {}}
              >
                {t.donate}
              </button>
            </section>


            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn-accent" onClick={onClose}>{t.close}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
