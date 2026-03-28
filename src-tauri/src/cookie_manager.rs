use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CookieSource {
    pub browser: String,
    pub label: String,
    pub available: bool,
}

#[cfg(target_os = "macos")]
pub fn available_cookie_sources() -> Vec<CookieSource> {
    vec![
        CookieSource {
            browser: "safari".into(),
            label: "Safari".into(),
            available: true,
        },
        CookieSource {
            browser: "chrome".into(),
            label: "Chrome".into(),
            available: browser_profile_exists("Chrome"),
        },
        CookieSource {
            browser: "firefox".into(),
            label: "Firefox".into(),
            available: browser_profile_exists("Firefox"),
        },
    ]
}

#[cfg(target_os = "linux")]
pub fn available_cookie_sources() -> Vec<CookieSource> {
    vec![
        CookieSource {
            browser: "firefox".into(),
            label: "Firefox".into(),
            available: browser_profile_exists("firefox"),
        },
        CookieSource {
            browser: "chrome".into(),
            label: "Chrome".into(),
            available: browser_profile_exists("google-chrome"),
        },
        CookieSource {
            browser: "chromium".into(),
            label: "Chromium".into(),
            available: browser_profile_exists("chromium"),
        },
    ]
}

#[cfg(target_os = "macos")]
fn browser_profile_exists(name: &str) -> bool {
    let home = std::env::var("HOME").unwrap_or_default();
    let chrome_path = format!("{home}/Library/Application Support/Google/{name}");
    let ff_path = format!("{home}/Library/Application Support/Firefox/Profiles");
    match name {
        "Chrome" => std::path::Path::new(&chrome_path).exists(),
        "Firefox" => std::path::Path::new(&ff_path).exists(),
        _ => false,
    }
}

#[cfg(target_os = "linux")]
fn browser_profile_exists(name: &str) -> bool {
    let home = std::env::var("HOME").unwrap_or_default();
    let path = format!("{home}/.config/{name}");
    std::path::Path::new(&path).exists()
}
