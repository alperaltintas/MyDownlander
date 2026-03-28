import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.className = dark ? "dark" : "light";
  }, [dark]);

  return (
    <button
      className="btn-ghost"
      onClick={() => setDark((d) => !d)}
      aria-label="Toggle theme"
      style={{ fontSize: 18, padding: "6px 10px" }}
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
}
