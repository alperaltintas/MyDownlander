import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useDownloadsStore } from "../store/downloads";

interface ProgressPayload {
  id: string;
  percent: number;
  speed: string;
  eta: string;
  status: string;
  file_path?: string;
}

export function useDownloadEvents() {
  const updateDownload = useDownloadsStore((s) => s.updateDownload);

  useEffect(() => {
    const unlisten = listen<ProgressPayload>("download-progress", (event) => {
      const { id, percent, speed, eta, status, file_path } = event.payload;
      updateDownload(id, {
        percent,
        speed,
        eta,
        status: status === "done" ? "done" : "downloading",
        ...(file_path ? { filePath: file_path } : {}),
      });
    });

    return () => {
      unlisten.then((f) => f());
    };
  }, [updateDownload]);
}
