import { useT } from "../hooks/useT";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function FormatPicker({ value, onChange }: Props) {
  const t = useT();
  const formats = [
    { id: "best", label: t.formatBest },
    { id: "mp4-1080", label: t.format1080 },
    { id: "mp4-720", label: t.format720 },
    { id: "mp4-480", label: t.format480 },
    { id: "audio-mp3", label: t.formatMp3 },
    { id: "audio-m4a", label: t.formatM4a },
  ];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "8px 12px",
        color: "var(--text-primary)",
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      {formats.map((f) => (
        <option key={f.id} value={f.id}>{f.label}</option>
      ))}
    </select>
  );
}
