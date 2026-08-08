use futures_util::StreamExt;
use serde::Serialize;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::ipc::Channel;

/// Returns the local directory where the DesktopRunner is downloaded and
/// extracted (e.g. `%LOCALAPPDATA%\AvintraDesktopApp\binaries\runner-app`).
fn runner_dir() -> Result<PathBuf, String> {
    let base = dirs::data_local_dir().ok_or("Cannot resolve local app data directory")?;
    Ok(base
        .join("AvintraDesktopApp")
        .join("binaries")
        .join("runner-app"))
}

/// Returns the path to the runner executable the app launches.
///
/// The downloaded archive contains `AvintraRunnerService.exe` (the artifact
/// name used by the standalone service install). The Tauri app renames it to
/// `AvintraRunnerApp.exe` after extraction so the launched process name is
/// clearly distinct from the headless service when both are installed.
pub fn runner_exe_path() -> Result<PathBuf, String> {
    Ok(runner_dir()?.join("AvintraRunnerApp.exe"))
}

/// Reads the installed runner version from the `version.txt` marker.
fn installed_version() -> Result<String, String> {
    let version_file = runner_dir()?.join("version.txt");
    if !version_file.exists() {
        return Err("not installed".into());
    }
    fs::read_to_string(&version_file)
        .map(|s| s.trim().to_string())
        .map_err(|e| e.to_string())
}

/* DATA STRUCTS (Sent to Frontend)
 */

/// The phase of the runner provisioning lifecycle.
///
/// IMPORTANT: These enum names must exactly match the TypeScript union used in
/// React (see `useRunnerProvisioning.ts`).
#[derive(Serialize, Clone, Debug)]
#[serde(rename_all = "UPPERCASE")]
pub enum RunnerStatus {
    Checking,
    Downloading,
    Extracting,
    Done,
    Error,
}

/// Represents the runner provisioning progress as the UI understands it.
/// This object is streamed continuously to React via IPC.
#[derive(Serialize, Clone, Debug)]
pub struct RunnerProgress {
    pub downloaded: u64,       // cumulative bytes downloaded so far
    pub total: Option<u64>,   // total size if known
    pub percentage: u8,       // best-effort percentage (0–100)
    pub status: RunnerStatus, // current phase of the provisioning lifecycle
}

/// Result of a runner availability check, returned to the frontend so it can
/// decide whether to download (first run) or prompt for an update.
#[derive(Serialize, Clone, Debug)]
pub struct RunnerCheckResult {
    /// True when a runner is already installed.
    pub installed: bool,
    /// The installed version (empty string when not installed).
    pub installed_version: String,
    /// The latest version available on the backend.
    pub latest_version: String,
    /// True when installed but the backend has a newer version.
    pub update_available: bool,
}

/* COMMAND: CHECK
 */

/// Queries the backend for the latest runner version and compares it with the
/// locally installed version. The frontend uses this to decide whether to
/// download (first run) or prompt the user to update.
#[tauri::command]
pub async fn check_runner_app(app_base_url: String) -> Result<RunnerCheckResult, String> {
    let latest_url = format!(
        "{}/accounts/api/binaries/runner/latest",
        app_base_url.trim_end_matches('/')
    );

    let resp = reqwest::get(&latest_url)
        .await
        .map_err(|e| format!("Failed to query latest runner version: {e}"))?;
    if !resp.status().is_success() {
        return Err(format!(
            "Latest runner check returned HTTP {}",
            resp.status()
        ));
    }

    #[derive(serde::Deserialize)]
    struct RunnerLatest {
        version: String,
    }
    let latest: RunnerLatest = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse latest runner response: {e}"))?;

    let installed = installed_version().ok();
    let installed_version = installed.clone().unwrap_or_default();
    let update_available = match &installed {
        Some(current) => current != &latest.version,
        None => false,
    };

    Ok(RunnerCheckResult {
        installed: installed.is_some(),
        installed_version,
        latest_version: latest.version,
        update_available,
    })
}

/* COMMAND: DOWNLOAD
 */

/// Downloads and extracts the latest DesktopRunner natively (no PowerShell).
/// Streams byte-level progress to the frontend via the `on_progress` channel,
/// then extracts the archive directly into the `runner-app` folder and
/// writes `version.txt` with the installed version.
#[tauri::command]
pub async fn download_runner_app(
    app_base_url: String,
    on_progress: Channel<RunnerProgress>,
) -> Result<String, String> {
    let base = app_base_url.trim_end_matches('/');
    let latest_url = format!("{base}/accounts/api/binaries/runner/latest");

    let _ = on_progress.send(RunnerProgress {
        downloaded: 0,
        total: None,
        percentage: 0,
        status: RunnerStatus::Checking,
    });

    // Resolve the latest version + download URL.
    let resp = reqwest::get(&latest_url)
        .await
        .map_err(|e| format!("Failed to query latest runner version: {e}"))?;
    if !resp.status().is_success() {
        return Err(format!(
            "Latest runner check returned HTTP {}",
            resp.status()
        ));
    }

    #[derive(serde::Deserialize)]
    struct RunnerLatest {
        version: String,
        url: String,
    }
    let latest: RunnerLatest = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse latest runner response: {e}"))?;

    let version = latest.version;
    let download_url = latest.url;

    // Download the zip, streaming progress.
    let _ = on_progress.send(RunnerProgress {
        downloaded: 0,
        total: None,
        percentage: 0,
        status: RunnerStatus::Downloading,
    });

    let dl_resp = reqwest::get(&download_url)
        .await
        .map_err(|e| format!("Failed to download runner archive: {e}"))?;
    if !dl_resp.status().is_success() {
        return Err(format!(
            "Runner download returned HTTP {}",
            dl_resp.status()
        ));
    }

    let total = dl_resp.content_length();
    let mut stream = dl_resp.bytes_stream();
    let mut downloaded: u64 = 0;
    let mut last_pct: u8 = 255;

    // Stream the archive to a temp file on disk rather than buffering the whole
    // (potentially 100+ MB) zip in memory.
    let temp_dir = std::env::temp_dir().join(format!("avintra-runner-{}", unique_suffix()));
    fs::create_dir_all(&temp_dir).map_err(|e| e.to_string())?;
    let zip_path = temp_dir.join("runner.zip");
    let mut zip_file = fs::File::create(&zip_path).map_err(|e| e.to_string())?;

    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| format!("Failed to read download stream: {e}"))?;
        downloaded += chunk.len() as u64;
        std::io::Write::write_all(&mut zip_file, &chunk)
            .map_err(|e| format!("Failed to write download stream: {e}"))?;

        let percentage = match total {
            Some(t) if t > 0 => (((downloaded as f64) / (t as f64)) * 100.0).min(99.0) as u8,
            _ => 0,
        };
        // Throttle progress updates to avoid spamming the channel.
        if last_pct == 255 || percentage.saturating_sub(last_pct) >= 2 {
            last_pct = percentage;
            let _ = on_progress.send(RunnerProgress {
                downloaded,
                total,
                percentage,
                status: RunnerStatus::Downloading,
            });
        }
    }
    drop(zip_file);

    // Extract the archive directly into the target directory.
    let _ = on_progress.send(RunnerProgress {
        downloaded,
        total,
        percentage: 100,
        status: RunnerStatus::Extracting,
    });

    let target_dir = runner_dir()?;
    fs::create_dir_all(&target_dir).map_err(|e| e.to_string())?;

    // Remove any previous install (legacy `latest` folder or flat layout) so
    // the new runner is always extracted into a clean directory.
    if let Ok(entries) = fs::read_dir(&target_dir) {
        for entry in entries.flatten() {
            let name = entry.file_name().to_string_lossy().into_owned();
            if name == "latest" || name.starts_with('v') {
                let _ = fs::remove_dir_all(entry.path());
            }
        }
    }

    let result = (|| -> Result<(), String> {
        extract_zip(&zip_path, &target_dir)?;

        // The archive contains the exe named after the service artifact
        // (AvintraRunnerService.exe). Rename it to AvintraRunnerApp.exe so the
        // launched process name is distinct from the headless service process.
        let service_exe = target_dir.join("AvintraRunnerService.exe");
        let app_exe = target_dir.join("AvintraRunnerApp.exe");
        if !service_exe.exists() {
            return Err(format!(
                "Expected runner executable not found in archive: {}",
                service_exe.display()
            ));
        }
        // Remove a stale app-named exe from a previous install before renaming,
        // so an interrupted upgrade never leaves two copies behind.
        let _ = fs::remove_file(&app_exe);
        fs::rename(&service_exe, &app_exe).map_err(|e| e.to_string())?;

        // Record the installed version marker.
        fs::write(target_dir.join("version.txt"), &version).map_err(|e| e.to_string())?;

        Ok(())
    })();

    let _ = fs::remove_dir_all(&temp_dir);

    result.map_err(|e| {
        let _ = on_progress.send(RunnerProgress {
            downloaded,
            total,
            percentage: 0,
            status: RunnerStatus::Error,
        });
        e
    })?;

    let _ = on_progress.send(RunnerProgress {
        downloaded,
        total,
        percentage: 100,
        status: RunnerStatus::Done,
    });

    Ok(version)
}

/// Extracts a zip archive from disk into the given destination directory.
///
/// Entry names are sanitized to prevent path traversal ("zip-slip"): any entry
/// that escapes `dest` (via `..`, absolute paths, or drive letters) is rejected.
fn extract_zip(zip_path: &Path, dest: &Path) -> Result<(), String> {
    let file = fs::File::open(zip_path).map_err(|e| format!("Failed to open zip archive: {e}"))?;
    let mut archive =
        zip::ZipArchive::new(file).map_err(|e| format!("Invalid zip archive: {e}"))?;

    for i in 0..archive.len() {
        let mut entry = archive
            .by_index(i)
            .map_err(|e| format!("Failed to read zip entry: {e}"))?;

        let name = entry.name().replace('\\', "/");
        // Reject absolute paths, drive letters, and parent traversal.
        if name.starts_with('/')
            || name.starts_with("//")
            || name.split('/').any(|seg| seg == "..")
            || name
                .chars()
                .next()
                .map(|c| c.is_ascii_alphabetic() && name.as_bytes().get(1) == Some(&b':'))
                .unwrap_or(false)
        {
            return Err(format!("Unsafe path in zip archive: {name}"));
        }

        let out_path = dest.join(&name);
        if entry.is_dir() {
            fs::create_dir_all(&out_path).map_err(|e| e.to_string())?;
            continue;
        }

        if let Some(parent) = out_path.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }

        let mut out_file = fs::File::create(&out_path).map_err(|e| e.to_string())?;
        std::io::copy(&mut entry, &mut out_file).map_err(|e| e.to_string())?;
    }

    Ok(())
}



/// Returns a unique suffix for temp dir names.
fn unique_suffix() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let nanos = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_nanos())
        .unwrap_or(0);
    format!("{}-{}", std::process::id(), nanos)
}
