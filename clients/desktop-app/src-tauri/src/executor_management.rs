use serde::Deserialize;
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::process::Command;

/// Remote metadata for the desktop executor returned by the server's latest endpoint.
#[derive(Deserialize)]
struct ExecutorLatest {
    version: String,
    url: String,
}

/// Returns the local install directory for the DesktopRunner
/// (e.g. `%LOCALAPPDATA%\AvintraDesktopApp\runner`).
fn executor_dir() -> Result<PathBuf, String> {
    let base = dirs::data_local_dir().ok_or("Cannot resolve local app data directory")?;
    Ok(base.join("AvintraDesktopApp").join("executor"))
}

/// Returns the path to the locally installed DesktopRunner executable.
pub fn executor_exe_path() -> Result<PathBuf, String> {
    Ok(executor_dir()?.join("AvintraDesktopRunner.exe"))
}

/// Reads the installed executor version from its `version.txt` marker.
fn installed_version() -> Result<String, String> {
    let version_file = executor_dir()?.join("version.txt");
    if !version_file.exists() {
        return Err("not installed".into());
    }
    fs::read_to_string(&version_file)
        .map(|s| s.trim().to_string())
        .map_err(|e| e.to_string())
}

/// Queries the server for the latest executor version.
async fn fetch_latest(app_base_url: &str) -> Result<ExecutorLatest, String> {
    let url = format!(
        "{}/accounts/api/desktop-app/desktop-executor/latest",
        app_base_url.trim_end_matches('/')
    );

    let resp = reqwest::get(&url)
        .await
        .map_err(|e| format!("Failed to query latest executor version: {e}"))?;
    if !resp.status().is_success() {
        return Err(format!("Latest executor check returned HTTP {}", resp.status()));
    }

    resp.json::<ExecutorLatest>()
        .await
        .map_err(|e| format!("Failed to parse latest executor response: {e}"))
}

/// Downloads and extracts the latest executor zip, then records the installed version.
async fn download_and_extract(_app_base_url: &str, latest: &ExecutorLatest) -> Result<(), String> {
    let dir = executor_dir()?;
    fs::create_dir_all(&dir).map_err(|e| e.to_string())?;

    // Download the zip into memory.
    let resp = reqwest::get(&latest.url)
        .await
        .map_err(|e| format!("Failed to download executor: {e}"))?;
    if !resp.status().is_success() {
        return Err(format!("Executor download returned HTTP {}", resp.status()));
    }
    let bytes = resp
        .bytes()
        .await
        .map_err(|e| format!("Failed to read executor download: {e}"))?;

    // Extract the zip over the current install (single-file exe inside).
    let mut archive =
        zip::ZipArchive::new(std::io::Cursor::new(bytes)).map_err(|e| e.to_string())?;
    for i in 0..archive.len() {
        let mut entry = archive
            .by_index(i)
            .map_err(|e| format!("Failed to read zip entry: {e}"))?;
        let out_path = dir.join(entry.name().replace('/', std::path::MAIN_SEPARATOR_STR));
        if entry.is_dir() {
            fs::create_dir_all(&out_path).map_err(|e| e.to_string())?;
            continue;
        }
        let parent = out_path
            .parent()
            .ok_or("Invalid path in executor zip")?;
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        let mut file = fs::File::create(&out_path).map_err(|e| e.to_string())?;
        std::io::copy(&mut entry, &mut file).map_err(|e| e.to_string())?;
        file.flush().map_err(|e| e.to_string())?;
    }

    // Record the installed version.
    let mut version_file = fs::File::create(dir.join("version.txt")).map_err(|e| e.to_string())?;
    version_file
        .write_all(latest.version.as_bytes())
        .map_err(|e| e.to_string())?;

    Ok(())
}

/// Ensures the DesktopExecutor is installed at the latest version.
/// Downloads and extracts it when missing or outdated. The executor is updated
/// independently from the Tauri app, so publishing a newer executor never
/// requires republishing the whole desktop app.
#[tauri::command]
pub async fn ensure_desktop_executor(app_base_url: String) -> Result<String, String> {
    let latest = fetch_latest(&app_base_url).await?;

    // Skip re-download when the installed version already matches.
    match installed_version() {
        Ok(current) if current == latest.version => {
            return Ok(latest.version);
        }
        _ => {}
    }

    download_and_extract(&app_base_url, &latest).await?;
    Ok(latest.version)
}

/// Installs the DesktopExecutor as a Windows service.
/// Requires the local executor to be present (call `ensure_desktop_executor` first).
/// `sc create` needs elevation, so the executor relaunches itself with UAC.
#[tauri::command]
pub fn install_desktop_executor_service() -> Result<(), String> {
    let exe_path = executor_exe_path()?;
    if !exe_path.exists() {
        return Err(format!(
            "Executor is not installed at {}",
            exe_path.display()
        ));
    }

    Command::new(exe_path)
        .arg("--install")
        .spawn()
        .map_err(|e| format!("Failed to start executor installer: {e}"))?;
    Ok(())
}

/// Uninstalls the DesktopExecutor Windows service.
#[tauri::command]
pub fn uninstall_desktop_executor_service() -> Result<(), String> {
    let exe_path = executor_exe_path()?;
    if !exe_path.exists() {
        return Err(format!(
            "Executor is not installed at {}",
            exe_path.display()
        ));
    }

    Command::new(exe_path)
        .arg("--uninstall")
        .spawn()
        .map_err(|e| format!("Failed to start executor uninstaller: {e}"))?;
    Ok(())
}

/// Returns the currently installed executor version (empty string when not installed).
#[tauri::command]
pub fn get_desktop_executor_version() -> String {
    installed_version().unwrap_or_default()
}
