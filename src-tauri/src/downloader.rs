use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Stdio;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProgressPayload {
    pub id: String,
    pub percent: f64,
    pub speed: String,
    pub eta: String,
    pub status: String,
    pub file_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadOptions {
    pub url: String,
    pub format: String,
    pub output_path: String,
    pub use_cookies: bool,
    pub cookie_browser: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadResult {
    pub id: String,
    pub file_path: String,
}

pub async fn fetch_title(url: String, ytdlp_path: String) -> Result<String, String> {
    let output = Command::new(&ytdlp_path)
        .args(["--print", "title", "--no-playlist", "--no-download", &url])
        .output()
        .await
        .map_err(|e| format!("yt-dlp error: {e}"))?;
    let title = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if title.is_empty() {
        Err("empty title".into())
    } else {
        Ok(title)
    }
}

/// Strip ANSI escape codes from a string
fn strip_ansi(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    let mut chars = s.chars().peekable();
    while let Some(c) = chars.next() {
        if c == '\x1b' {
            // consume until a letter (end of escape sequence)
            for next in chars.by_ref() {
                if next.is_ascii_alphabetic() { break; }
            }
        } else {
            out.push(c);
        }
    }
    out
}

pub async fn start_download(
    app: AppHandle,
    id: String,
    options: DownloadOptions,
    ytdlp_path: String,
    pids: Arc<Mutex<HashMap<String, u32>>>,
) -> Result<DownloadResult, String> {
    let mut args: Vec<String> = vec![
        "--newline".into(),
        "--no-playlist".into(),
        "--continue".into(),
        "--progress".into(),
        "--progress-template".into(),
        "%(progress._percent_str)s|%(progress._speed_str)s|%(progress._eta_str)s".into(),
        "--print".into(),
        "after_move:filepath".into(),
    ];

    match options.format.as_str() {
        "best" => { args.extend(["-f".into(), "bestvideo+bestaudio/best".into()]); }
        "mp4-1080" => { args.extend(["-f".into(), "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]".into()]); }
        "mp4-720" => { args.extend(["-f".into(), "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]".into()]); }
        "mp4-480" => { args.extend(["-f".into(), "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]".into()]); }
        "audio-mp3" => { args.extend(["-x".into(), "--audio-format".into(), "mp3".into(), "--audio-quality".into(), "0".into()]); }
        "audio-m4a" => { args.extend(["-x".into(), "--audio-format".into(), "m4a".into()]); }
        _ => { args.extend(["-f".into(), "bestvideo+bestaudio/best".into()]); }
    }

    if options.use_cookies {
        if let Some(browser) = &options.cookie_browser {
            args.extend(["--cookies-from-browser".into(), browser.clone()]);
        }
    }

    let output_template = format!("{}/%(title)s.%(ext)s", options.output_path);
    args.extend(["-o".into(), output_template.clone(), options.url.clone()]);

    let mut child = Command::new(&ytdlp_path)
        .args(&args)
        .env("PYTHONUNBUFFERED", "1")
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn yt-dlp: {e}"))?;

    if let Some(pid) = child.id() {
        if let Ok(mut map) = pids.lock() {
            map.insert(id.clone(), pid);
        }
    }

    let stdout = child.stdout.take().ok_or("no stdout")?;
    let stderr = child.stderr.take().ok_or("no stderr")?;

    let mut stdout_reader = BufReader::new(stdout).lines();
    let mut stderr_reader = BufReader::new(stderr).lines();

    let app_stdout = app.clone();
    let id_stdout = id.clone();
    let app_stderr = app.clone();
    let id_stderr = id.clone();
    let mut final_path = output_template.clone();

    // Helper closure logic: emit a progress event from a parsed line
    // Returns Some(file_path) if the line looks like a file path, None otherwise
    fn parse_progress_line(line: &str, app: &AppHandle, id: &str) -> Option<String> {
        let clean = strip_ansi(line);
        let parts: Vec<&str> = clean.split('|').collect();
        if parts.len() >= 3 {
            let percent = parts[0].trim().trim_end_matches('%').parse::<f64>().unwrap_or(0.0);
            let _ = app.emit("download-progress", ProgressPayload {
                id: id.to_string(),
                percent,
                speed: parts[1].trim().to_string(),
                eta: parts[2].trim().to_string(),
                status: "downloading".into(),
                file_path: None,
            });
            None
        } else {
            let trimmed = clean.trim().to_string();
            if !trimmed.is_empty() && !trimmed.starts_with('[') {
                Some(trimmed)
            } else {
                None
            }
        }
    }

    // Read stdout and stderr concurrently using tokio::select!
    loop {
        tokio::select! {
            line = stdout_reader.next_line() => {
                match line {
                    Ok(Some(l)) => {
                        if let Some(path) = parse_progress_line(&l, &app_stdout, &id_stdout) {
                            final_path = path;
                        }
                    }
                    _ => break,
                }
            }
            line = stderr_reader.next_line() => {
                match line {
                    Ok(Some(l)) => {
                        parse_progress_line(&l, &app_stderr, &id_stderr);
                    }
                    _ => {}
                }
            }
        }
    }

    // Drain remaining stderr after stdout closes
    while let Ok(Some(l)) = stderr_reader.next_line().await {
        parse_progress_line(&l, &app_stderr, &id_stderr);
    }

    let status = child.wait().await.map_err(|e| format!("Process error: {e}"))?;

    if let Ok(mut map) = pids.lock() {
        map.remove(&id);
    }

    if !status.success() {
        return Err(format!("yt-dlp exited with: {status}"));
    }

    let _ = app.emit("download-progress", ProgressPayload {
        id: id.clone(),
        percent: 100.0,
        speed: String::new(),
        eta: String::new(),
        status: "done".into(),
        file_path: Some(final_path.clone()),
    });

    Ok(DownloadResult { id, file_path: final_path })
}
