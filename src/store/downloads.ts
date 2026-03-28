import { create } from "zustand";

export type DownloadStatus =
  | "queued"
  | "downloading"
  | "done"
  | "error"
  | "cancelled"
  | "paused";

export interface Download {
  id: string;
  url: string;
  title: string;
  format: string;
  status: DownloadStatus;
  percent: number;
  speed: string;
  eta: string;
  error?: string;
  filePath?: string;
}

interface DownloadsState {
  downloads: Download[];
  addDownload: (d: Omit<Download, "percent" | "speed" | "eta">) => void;
  updateDownload: (id: string, patch: Partial<Download>) => void;
  removeDownload: (id: string) => void;
  clearDone: () => void;
}

export const useDownloadsStore = create<DownloadsState>((set) => ({
  downloads: [],
  addDownload: (d) =>
    set((s) => ({
      downloads: [
        ...s.downloads,
        { ...d, percent: 0, speed: "", eta: "" },
      ],
    })),
  updateDownload: (id, patch) =>
    set((s) => ({
      downloads: s.downloads.map((d) =>
        d.id === id ? { ...d, ...patch } : d
      ),
    })),
  removeDownload: (id) =>
    set((s) => ({ downloads: s.downloads.filter((d) => d.id !== id) })),
  clearDone: () =>
    set((s) => ({
      downloads: s.downloads.filter(
        (d) => d.status !== "done" && d.status !== "error"
      ),
    })),
}));
