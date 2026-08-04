use serde::Serialize;
use std::process::Command;

#[tauri::command]
pub fn launch_desktop_executor(
    app_base_url: String,
    job_id: String,
    access_token: String,
    os_id: String,
    username: String,
    app_version: String,
) -> Result<(), String> {
    // The executor is installed independently (via ensure_desktop_executor) under the
    // local app data dir so it can be updated without republishing the whole Tauri app.
    let desktop_executor_path = crate::executor_management::executor_exe_path()?;

    if !desktop_executor_path.exists() {
        return Err(format!(
            "Executor is not installed at: {}",
            desktop_executor_path.display()
        ));
    }

    Command::new(desktop_executor_path)
        .arg("--appBaseUrl")
        .arg(app_base_url)
        .arg("--jobId")
        .arg(job_id)
        .arg("--accessToken")
        .arg(access_token)
        .arg("--osId")
        .arg(os_id)
        .arg("--username")
        .arg(username)
        .arg("--appVersion")
        .arg(app_version)
        .spawn()
        .map_err(|e| format!("Failed to start the executor: {}", e))?;
    Ok(())
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
    pub app_version: String,
}

/// Retrieves complete user metadata for tracking and identification
///
/// Returns OS installation ID, username, and app version.
///
/// OS ID Sources:
/// - Windows: MachineGuid from Registry (HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Cryptography)
/// - Linux: /etc/machine-id (primary) or /var/lib/dbus/machine-id (fallback)
///
/// Username Sources:
/// - Windows: USERNAME environment variable (e.g., "john.doe", "Administrator")
/// - Linux: USER environment variable (e.g., "john", "root")
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

    // Get app version from Cargo.toml at compile time

    let app_version = env!("CARGO_PKG_VERSION").to_string();

    Ok(UserMetadata {
        os_id,
        username,
        app_version,
    })
}
