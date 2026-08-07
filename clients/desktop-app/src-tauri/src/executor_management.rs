use std::fs;
use std::path::PathBuf;
use std::process::Command;

/// Returns the local directory where the DesktopRunner is downloaded and
/// extracted (e.g. `%LOCALAPPDATA%\AvintraDesktopApp\binaries\desktop-executor`).
///
/// The runner is provisioned by the `Download-AvintraDesktopRunner.ps1` script
/// into a versioned layout under this directory:
///   - `latest\AvintraDesktopRunner.exe`  <- the version the app launches
///   - `v<version>\...`                   <- archived copies of older versions
fn executor_dir() -> Result<PathBuf, String> {
    let base = dirs::data_local_dir().ok_or("Cannot resolve local app data directory")?;
    Ok(base
        .join("AvintraDesktopApp")
        .join("binaries")
        .join("desktop-executor"))
}

/// Returns the path to the DesktopRunner executable the app launches
/// (always the `latest` folder).
pub fn executor_exe_path() -> Result<PathBuf, String> {
    Ok(executor_dir()?.join("latest").join("AvintraDesktopRunner.exe"))
}

/// Reads the installed executor version from the `latest\version.txt` marker.
fn installed_version() -> Result<String, String> {
    let version_file = executor_dir()?.join("latest").join("version.txt");
    if !version_file.exists() {
        return Err("not installed".into());
    }
    fs::read_to_string(&version_file)
        .map(|s| s.trim().to_string())
        .map_err(|e| e.to_string())
}

/// Downloads the download-only provisioning script to a temp file and runs it
/// with PowerShell. The script resolves the latest runner version from the
/// backend, downloads the archive, and extracts it into the versioned layout.
async fn run_download_script(app_base_url: &str) -> Result<(), String> {
    let script_url = format!(
        "{}/accounts/api/desktop-app/script/Download-AvintraDesktopRunner.ps1",
        app_base_url.trim_end_matches('/')
    );

    // Download the script into a temp file.
    let resp = reqwest::get(&script_url)
        .await
        .map_err(|e| format!("Failed to download provisioning script: {e}"))?;
    if !resp.status().is_success() {
        return Err(format!(
            "Provisioning script download returned HTTP {}",
            resp.status()
        ));
    }
    let bytes = resp
        .bytes()
        .await
        .map_err(|e| format!("Failed to read provisioning script: {e}"))?;

    let script_path = std::env::temp_dir().join("Download-AvintraDesktopRunner.ps1");
    fs::write(&script_path, &bytes).map_err(|e| e.to_string())?;

    let target_dir = executor_dir()?;
    fs::create_dir_all(&target_dir).map_err(|e| e.to_string())?;

    // Run the script with PowerShell. We use std::process::Command (not the shell
    // plugin) so no extra capability is required. The script does not need
    // elevation because it writes under the user's LOCALAPPDATA.
    let output = Command::new("powershell")
        .args([
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            script_path.to_str().ok_or("Invalid script path")?,
            "-AppBaseUrl",
            app_base_url,
            "-TargetDir",
            target_dir.to_str().ok_or("Invalid target dir")?,
        ])
        .output()
        .map_err(|e| format!("Failed to run provisioning script: {e}"))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    if !output.status.success() {
        return Err(format!(
            "Provisioning script failed (exit {}):\n{}{}",
            output.status,
            stdout,
            stderr
        ));
    }

    Ok(())
}

/// Ensures the DesktopRunner is downloaded and extracted at the latest version.
/// Runs the download-only PowerShell script when the runner is missing or the
/// installed version differs from the latest. The runner is updated
/// independently from the Tauri app, so publishing a newer runner never
/// requires republishing the whole desktop app.
#[tauri::command]
pub async fn ensure_desktop_executor(app_base_url: String) -> Result<String, String> {
    // Query the server for the latest version so we can skip the script when the
    // installed version already matches.
    let latest_url = format!(
        "{}/accounts/api/desktop-app/desktop-executor/latest",
        app_base_url.trim_end_matches('/')
    );

    let resp = reqwest::get(&latest_url)
        .await
        .map_err(|e| format!("Failed to query latest executor version: {e}"))?;
    if !resp.status().is_success() {
        return Err(format!(
            "Latest executor check returned HTTP {}",
            resp.status()
        ));
    }

    #[derive(serde::Deserialize)]
    struct ExecutorLatest {
        version: String,
    }
    let latest: ExecutorLatest = resp
        .json()
        .await
        .map_err(|e| format!("Failed to parse latest executor response: {e}"))?;

    // Skip re-download when the installed version already matches.
    match installed_version() {
        Ok(current) if current == latest.version => {
            return Ok(latest.version);
        }
        _ => {}
    }

    run_download_script(&app_base_url).await?;
    Ok(latest.version)
}

/// Returns the currently installed executor version (empty string when not installed).
#[tauri::command]
pub fn get_desktop_executor_version() -> String {
    installed_version().unwrap_or_default()
}
