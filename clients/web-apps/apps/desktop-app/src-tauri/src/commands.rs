use serde::Serialize;
use std::fs::OpenOptions;
use std::path::PathBuf;
use std::process::{Command, Stdio};

#[tauri::command]
pub fn launch_runner_app(
    app_base_url: String,
    job_id: String,
    access_token: String,
) -> Result<(), String> {
    // The runner is provisioned independently (via download_runner_app) under
    // the local app data dir so it can be updated without republishing the whole
    // Tauri app. The app always launches the runner from the runner-app folder.
    // RunnerApp reads its own machine identity (osId, username, hostname, appVersion),
    // so the values the desktop app passes are the API URL, job id, and access token.
    // The mode is derived by the runner itself from IsServiceMode (apiKey+tenantId),
    // which are absent here, so the runner always runs in local mode.
    //
    // The local Tauri WebSocket port is read directly from the in-process WebSocket
    // server (websocket::get_websocket_port) rather than passed through the frontend,
    // and forwarded so the runner can push node progress and receive abort/pause/resume
    // control messages.
    let runner_app_path = crate::runner_management::runner_exe_path()?;

    if !runner_app_path.exists() {
        return Err(format!(
            "Runner is not installed at: {}",
            runner_app_path.display()
        ));
    }

    let mut cmd = Command::new(runner_app_path);
    cmd.arg("--appBaseUrl")
        .arg(app_base_url)
        .arg("--jobId")
        .arg(job_id)
        .arg("--accessToken")
        .arg(access_token);

    if let Some(port) = crate::websocket::get_websocket_port() {
        if port > 0 {
            cmd.arg("--websocketPort").arg(port.to_string());
        }
    }

    // The desktop app does not capture the runner's stdout, so redirect it (and
    // stderr) to the same debug log file the runner itself writes to, making
    // console output visible when debugging a run.
    cmd.stdout(Stdio::from(open_runner_log()?))
        .stderr(Stdio::from(open_runner_log()?));

    cmd.spawn()
        .map_err(|e| format!("Failed to start the runner: {}", e))?;
    Ok(())
}

/// Opens (creates/append) the runner debug log file used by the runner itself
/// (%LOCALAPPDATA%\AvintraDesktopApp\logs\runner-debug.log) for stdout/stderr redirection.
fn open_runner_log() -> Result<std::fs::File, String> {
    let dir: PathBuf = dirs::data_local_dir()
        .ok_or("Cannot resolve local app data directory")?
        .join("AvintraDesktopApp")
        .join("logs");
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("Failed to create logs directory {}: {}", dir.display(), e))?;
    OpenOptions::new()
        .create(true)
        .append(true)
        .open(dir.join("runner-debug.log"))
        .map_err(|e| format!("Failed to open runner debug log: {}", e))
}

#[tauri::command]
pub fn launch_ui_inspector(ws_port: u16) -> Result<(), String> {
    // Get the directory where tauri_app.exe is running
    let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_dir = current_exe
        .parent()
        .ok_or("Failed to get parent directory")?;

    // Construct the path to the UI inspector executable
    let ui_inspector_path = exe_dir
        .join("binaries")
        .join("ui-inspector")
        .join("UIInspector.exe");

    if !ui_inspector_path.exists() {
        return Err(format!(
            "Inspector is not found at: {}",
            ui_inspector_path.display()
        ));
    }

    Command::new(ui_inspector_path)
        .arg(ws_port.to_string())
        .spawn()
        .map_err(|e| format!("Failed to start the inspector: {}", e))?;
    Ok(())
}

#[derive(Serialize)]
pub struct UserMetadata {
    pub os_id: String,
    pub username: String,
    pub hostname: String,
    pub app_version: String,
}

/// Retrieves complete user metadata for tracking and identification
///
/// Returns OS installation ID, username, hostname, and app version.
///
/// OS ID Sources:
/// - Windows: MachineGuid from Registry (HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography)
/// - Linux: /etc/machine-id (primary) or /var/lib/dbus/machine-id (fallback)
///
/// Username Sources:
/// - Windows: USERNAME environment variable (e.g., "john.doe", "Administrator")
/// - Linux: USER environment variable (e.g., "john", "root")
///
/// Hostname Source:
/// - tauri-plugin-os hostname() helper
///
/// App Version: Extracted from Cargo.toml at compile time
#[tauri::command]
pub fn get_user_metadata() -> Result<UserMetadata, String> {
    // Get unique OS installation identifier
    #[cfg(target_os = "windows")]
    let os_id = {
        use winreg::enums::*;
        use winreg::RegKey;

        // Open registry key containing machine GUID
        let key = RegKey::predef(HKEY_LOCAL_MACHINE)
            .open_subkey("SOFTWARE\\Microsoft\\Cryptography")
            .map_err(|e| format!("Cannot open registry key: {}", e))?;

        // Read MachineGuid value
        key.get_value("MachineGuid")
            .map_err(|e| format!("Cannot read MachineGuid: {}", e))?
    };

    #[cfg(target_os = "linux")]
    let os_id = {
        use std::fs;

        // Try primary location (systemd standard)
        if let Ok(guid) = fs::read_to_string("/etc/machine-id") {
            guid.trim().to_string()
        }
        // Fallback to D-Bus location
        else if let Ok(guid) = fs::read_to_string("/var/lib/dbus/machine-id") {
            guid.trim().to_string()
        } else {
            return Err(
                "Cannot read machine-id from /etc/machine-id or /var/lib/dbus/machine-id".into(),
            );
        }
    };

    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    let os_id: String =
        return Err("OS installation GUID is only available on Windows and Linux".into());

    // Get currently logged-in username

    #[cfg(target_os = "windows")]
    let username = {
        // Read USERNAME environment variable (e.g., "john.doe", "Administrator")
        std::env::var("USERNAME")
            .map_err(|_| "Failed to get USERNAME environment variable".to_string())?
    };

    #[cfg(target_os = "linux")]
    let username = {
        // Read USER environment variable (e.g., "john", "root")
        std::env::var("USER").map_err(|_| "Failed to get USER environment variable".to_string())?
    };

    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    let username: String =
        return Err("Username retrieval is only available on Windows and Linux".into());

    // Get hostname from the OS
    let hostname = tauri_plugin_os::hostname();

    // Get app version from Cargo.toml at compile time
    let app_version = env!("CARGO_PKG_VERSION").to_string();

    Ok(UserMetadata {
        os_id,
        username,
        hostname,
        app_version,
    })
}
