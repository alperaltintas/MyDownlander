import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "../hooks/useT";

interface CookieSource {
  browser: string;
  label: string;
  available: boolean;
}

interface Props {
  open: boolean;
  selectedBrowser: string | null;
  onSelect: (browser: string | null) => void;
  onClose: () => void;
}

export function AuthModal({ open, selectedBrowser, onSelect, onClose }: Props) {
  const [sources, setSources] = useState<CookieSource[]>([]);
  const t = useT();

  useEffect(() => {
    if (open) {
      invoke<CookieSource[]>("get_cookie_sources").then(setSources).catch(() => {});
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
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
            style={{ padding: 24, minWidth: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: "var(--text-primary)" }}>
              {t.authTitle}
            </h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 16 }}>
              {t.authDesc}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "var(--text-primary)" }}>
                <input type="radio" name="browser" checked={selectedBrowser === null} onChange={() => onSelect(null)} />
                {t.noCookies}
              </label>
              {sources.map((s) => (
                <label
                  key={s.browser}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    cursor: s.available ? "pointer" : "not-allowed",
                    fontSize: 14,
                    color: s.available ? "var(--text-primary)" : "var(--text-secondary)",
                    opacity: s.available ? 1 : 0.5,
                  }}
                >
                  <input type="radio" name="browser" disabled={!s.available} checked={selectedBrowser === s.browser} onChange={() => onSelect(s.browser)} />
                  {s.label}{!s.available && ` ${t.notFound}`}
                </label>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
              <button className="btn-accent" onClick={onClose}>{t.authDone}</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
