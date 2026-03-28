use std::fs;
use std::path::PathBuf;

#[cfg(target_os = "macos")]
const YTDLP_ASSET: &str = "yt-dlp_macos";

#[cfg(target_os = "linux")]
const YTDLP_ASSET: &str = "yt-dlp_linux";

pub async fn update_ytdlp(bin_dir: PathBuf) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .user_agent("MyDownloader/0.1")
        .build()
        .map_err(|e: reqwest::Error| e.to_string())?;

    let release: serde_json::Value = client
        .get("https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest")
        .send()
        .await
        .map_err(|e: reqwest::Error| e.to_string())?
        .json()
        .await
        .map_err(|e: reqwest::Error| e.to_string())?;

    let tag = release["tag_name"]
        .as_str()
        .ok_or("no tag_name")?
        .to_string();

    let assets = release["assets"].as_array().ok_or("no assets")?;
    let url = assets
        .iter()
        .find(|a| a["name"].as_str().unwrap_or("") == YTDLP_ASSET)
        .and_then(|a| a["browser_download_url"].as_str())
        .ok_or(format!("asset {YTDLP_ASSET} not found"))?
        .to_string();

    let bytes = client
        .get(&url)
        .send()
        .await
        .map_err(|e: reqwest::Error| e.to_string())?
        .bytes()
        .await
        .map_err(|e: reqwest::Error| e.to_string())?;

    let dest = bin_dir.join(YTDLP_ASSET);
    fs::write(&dest, &bytes).map_err(|e| e.to_string())?;

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(&dest, fs::Permissions::from_mode(0o755))
            .map_err(|e| e.to_string())?;
    }

    Ok(tag)
}
