mod cookie_manager;
mod downloader;
mod tray;
mod updater;

use cookie_manager::CookieSource;
use downloader::{DownloadOptions, DownloadResult};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Manager, State};

pub struct AppState {
    pub download_pids: Arc<Mutex<HashMap<String, u32>>>,
}

fn ytdlp_binary_path(app: &AppHandle) -> String {
    let resource_dir = app
        .path()
        .resource_dir()
        .unwrap_or_else(|_| std::path::PathBuf::from("."));

    #[cfg(all(target_arch = "aarch64", target_os = "macos"))]
    let binary_name = "yt-dlp-aarch64-apple-darwin";
    #[cfg(all(target_arch = "x86_64", target_os = "macos"))]
    let binary_name = "yt-dlp-x86_64-apple-darwin";
    #[cfg(all(target_arch = "x86_64", target_os = "linux"))]
    let binary_name = "yt-dlp-x86_64-unknown-linux";

    let bundled = resource_dir.join("binaries").join(binary_name);
    if bundled.exists() {
        return bundled.to_string_lossy().to_string();
    }
    "yt-dlp".to_string()
}

#[tauri::command]
async fn start_download(
    app: AppHandle,
    id: String,
    options: DownloadOptions,
    state: State<'_, AppState>,
) -> Result<DownloadResult, String> {
    let ytdlp = ytdlp_binary_path(&app);
    let pids = Arc::clone(&state.download_pids);
    downloader::start_download(app, id, options, ytdlp, pids).await
}

#[tauri::command]
async fn get_video_title(url: String, app: AppHandle) -> Result<String, String> {
    let ytdlp = ytdlp_binary_path(&app);
    downloader::fetch_title(url, ytdlp).await
}

#[tauri::command]
async fn pause_download(id: String, state: State<'_, AppState>) -> Result<(), String> {
    let pids = state.download_pids.lock().map_err(|e| e.to_string())?;
    if let Some(&pid) = pids.get(&id) {
        nix::sys::signal::kill(
            nix::unistd::Pid::from_raw(pid as i32),
            nix::sys::signal::Signal::SIGSTOP,
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn resume_download(id: String, state: State<'_, AppState>) -> Result<(), String> {
    let pids = state.download_pids.lock().map_err(|e| e.to_string())?;
    if let Some(&pid) = pids.get(&id) {
        nix::sys::signal::kill(
            nix::unistd::Pid::from_raw(pid as i32),
            nix::sys::signal::Signal::SIGCONT,
        )
        .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn open_file(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    std::process::Command::new("open")
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;
    #[cfg(target_os = "linux")]
    std::process::Command::new("xdg-open")
        .arg(&path)
        .spawn()
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_cookie_sources() -> Vec<CookieSource> {
    cookie_manager::available_cookie_sources()
}

#[tauri::command]
async fn update_ytdlp(app: AppHandle) -> Result<String, String> {
    let resource_dir = app.path().resource_dir().map_err(|e| e.to_string())?;
    let bin_dir = resource_dir.join("binaries");
    std::fs::create_dir_all(&bin_dir).map_err(|e| e.to_string())?;
    updater::update_ytdlp(bin_dir).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState {
            download_pids: Arc::new(Mutex::new(HashMap::new())),
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
                if let Some(window) = app.get_webview_window("main") {
                    apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                        .expect("Failed to apply vibrancy");
                }
            }
            tray::setup_tray(&app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_download,
            get_video_title,
            pause_download,
            resume_download,
            open_file,
            get_cookie_sources,
            update_ytdlp,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
