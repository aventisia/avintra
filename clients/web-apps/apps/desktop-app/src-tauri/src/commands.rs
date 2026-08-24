use serde::Serialize;
use std::fs::OpenOptions;
#[cfg(windows)]
use std::os::windows::process::CommandExt;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;

/// Creation flag that prevents a console window from being created for a
/// console-subsystem process (used to hide the RunnerApp's black terminal).
const CREATE_NO_WINDOW: u32 = 0x0800_0000;

static RUNNER_ACTIVE: AtomicBool = AtomicBool::new(false);
static LAST_RUNNER_CHILD: std::sync::LazyLock<Arc<Mutex<Option<Child>>>> =
    std::sync::LazyLock::new(|| Arc::new(Mutex::new(None)));
static RUNNER_EXIT_HANDLE: Mutex<Option<std::thread::JoinHandle<()>>> = Mutex::new(None);

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

    // Guard against concurrent local executions from the same desktop session.
    // The Tauri local WS server is a broadcast bus; running two jobs at once makes
    // progress/control messages ambiguous. This flag resets if the desktop app restarts.
    if RUNNER_ACTIVE
        .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
        .is_err()
    {
        return Err(
            "A local runner is already active. Wait for it to finish or restart the desktop app."
                .to_string(),
        );
    }

    let runner_app_path = crate::runner_management::runner_exe_path()?;

    if !runner_app_path.exists() {
        RUNNER_ACTIVE.store(false, Ordering::SeqCst);
        return Err(format!(
            "Runner is not installed at: {}",
            runner_app_path.display()
        ));
    }

    let mut cmd = Command::new(runner_app_path);
    cmd.arg("--appBaseUrl")
        .arg(app_base_url)
        .arg("--jobId")
        .arg(&job_id)
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

    // Hide the runner's console window so the black terminal doesn't flash on
    // screen when the executor launches from the desktop app.
    #[cfg(windows)]
    cmd.creation_flags(CREATE_NO_WINDOW);

    // Spawn and clear the guard if the process fails to start. If it succeeds,
    // spawn a background thread that waits for the child to exit and then clears
    // RUNNER_ACTIVE so the next run can be launched without restarting the desktop app.
    match cmd.spawn() {
        Ok(child) => {
            // The reaper thread owns waiting. We move the Child handle into a static
            // mutex so a single long-lived thread can wait for the process to exit.
            // Do NOT call wait() on the main thread; we must return to the frontend
            // immediately after spawning.
            let mut child_guard = LAST_RUNNER_CHILD.lock().map_err(|e| e.to_string())?;
            *child_guard = Some(child);
            drop(child_guard);

            let mut handle_guard = RUNNER_EXIT_HANDLE.lock().map_err(|e| e.to_string())?;
            if handle_guard.is_none() {
                let child_arc = Arc::clone(&LAST_RUNNER_CHILD);
                *handle_guard = Some(std::thread::spawn(move || {
                    loop {
                        let mut child_guard = child_arc.lock().unwrap();
                        if let Some(mut child) = child_guard.take() {
                            drop(child_guard); // release lock while blocking on wait()
                            let _ = child.wait();
                            RUNNER_ACTIVE.store(false, Ordering::SeqCst);
                        } else {
                            // No child currently stored; idle until next spawn. Keep the
                            // thread alive with a brief sleep to avoid busy-waiting.
                            drop(child_guard);
                            std::thread::sleep(Duration::from_millis(100));
                        }
                    }
                }));
            }
            Ok(())
        }
        Err(e) => {
            RUNNER_ACTIVE.store(false, Ordering::SeqCst);
            Err(format!("Failed to start the runner: {}", e))
        }
    }
}

/// Opens (creates/append) the runner debug log file used by the runner itself
/// (%LOCALAPPDATA%\AvintraDesktopApp\logs\runner-debug-yyyy-MM-dd.log) for stdout/stderr redirection.
/// A new file is created each calendar day so no single log file grows unbounded.
fn open_runner_log() -> Result<std::fs::File, String> {
    let dir: PathBuf = dirs::data_local_dir()
        .ok_or("Cannot resolve local app data directory")?
        .join("AvintraDesktopApp")
        .join("logs");
    std::fs::create_dir_all(&dir)
        .map_err(|e| format!("Failed to create logs directory {}: {}", dir.display(), e))?;

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let log_path = dir.join(format!("runner-debug-{}.log", today));

    OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
        .map_err(|e| {
            format!(
                "Failed to open runner debug log {}: {}",
                log_path.display(),
                e
            )
        })
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
