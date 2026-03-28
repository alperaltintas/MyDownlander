import { useRef, useState } from "react";
import { readClipboardUrl } from "../hooks/useClipboard";
import { FormatPicker } from "./FormatPicker";
import { useT } from "../hooks/useT";

interface Props {
  onSubmit: (url: string, format: string) => void;
  disabled?: boolean;
}

export function UrlInput({ onSubmit, disabled }: Props) {
  const [url, setUrl] = useState("");
  const [format, setFormat] = useState("best");
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useT();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onSubmit(url.trim(), format);
    setUrl("");
  };

  const pasteClip = async () => {
    const text = await readClipboardUrl();
    if (text) setUrl(text);
    inputRef.current?.focus();
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
    >
      <div style={{ flex: 1, minWidth: 220, position: "relative", display: "flex" }}>
        <input
          ref={inputRef}
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t.urlPlaceholder}
          disabled={disabled}
          style={{
            flex: 1,
            padding: "10px 40px 10px 14px",
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            color: "var(--text-primary)",
            fontSize: 14,
            outline: "none",
          }}
        />
        <button
          type="button"
          onClick={pasteClip}
          title={t.pasteTooltip}
          style={{
            position: "absolute",
            right: 8,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 16,
            color: "var(--accent)",
            padding: "2px 4px",
            lineHeight: 1,
          }}
        >
          📋
        </button>
      </div>
      <FormatPicker value={format} onChange={setFormat} />
      <button type="submit" className="btn-accent" disabled={disabled || !url.trim()}>
        {t.downloadBtn}
      </button>
    </form>
  );
}
