import { readText } from "@tauri-apps/plugin-clipboard-manager";

export async function readClipboardUrl(): Promise<string | null> {
  try {
    const text = await readText();
    return text?.trim() || null;
  } catch {
    return null;
  }
}
