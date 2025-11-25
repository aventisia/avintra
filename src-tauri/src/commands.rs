use std::process::Command;

#[tauri::command]
pub fn launch_desktop_executor(
    ws_port: u16,
    agent_id: String,
    agent_name: String,
    access_token: String,
) -> Result<(), String> {
    // Get the directory where tauri_app.exe is running
    let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_dir = current_exe
        .parent()
        .ok_or("Failed to get parent directory")?;

    // Construct the path to the node executor
    let desktop_executor_path = exe_dir
        .join("binaries")
        .join("node-executor")
        .join("NodeExecutor.exe");

    if !desktop_executor_path.exists() {
        return Err(format!(
            "Executor is not found at: {}",
            desktop_executor_path.display()
        ));
    }

    Command::new(desktop_executor_path)
        .arg(ws_port.to_string())
        .arg(agent_id)
        .arg(agent_name)
        .arg(access_token)
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

/// Provides functions to retrieve unique hardware and software identifiers for device fingerprinting, licensing, or system identification.
/// Retrieves the system's hardware UUID from BIOS/UEFI firmware (Windows only).
///
/// - Uses PowerShell to query `Win32_ComputerSystemProduct` WMI class for the UUID.
/// - Returns a persistent hardware identifier that survives OS reinstalls and disk replacements.
/// - Returns `Ok(uuid)` on success, or `Err(reason)` on failure (e.g., PowerShell/WMI errors, empty UUID).
/// - Requires PowerShell execution rights; may need elevation.
///
/// Example:
/// ```
/// match get_hardware_uuid() {
///     Ok(uuid) => println!("Hardware UUID: {}", uuid),
///     Err(e) => eprintln!("Failed to get hardware UUID: {}", e),
/// }
/// ```
#[tauri::command]
pub fn get_machine_hardware_uuid() -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        use std::process::Command;

        // Execute PowerShell command to read hardware UUID from WMI
        // -NoProfile: Skips loading PowerShell profile for faster execution
        // -Command: Runs a single command and exits
        let output = Command::new("powershell")
            .args([
                "-NoProfile",
                "-Command",
                "(Get-WmiObject Win32_ComputerSystemProduct).UUID",
            ])
            .output()
            .map_err(|e| format!("Failed to run PowerShell: {}", e))?;

        // Check if PowerShell command executed successfully (exit code 0)
        if !output.status.success() {
            return Err("PowerShell command failed".into());
        }

        // Convert stdout bytes to string and clean whitespace
        // from_utf8_lossy handles any invalid UTF-8 gracefully
        let uuid = String::from_utf8_lossy(&output.stdout).trim().to_string();

        // Validate that we actually received data
        if uuid.is_empty() {
            return Err("Received empty UUID".into());
        }

        Ok(uuid)
    }

    // Placeholder for future OS support (macOS, Linux)
    // Consider implementing:
    // - macOS: system_profiler SPHardwareDataType or IOPlatformUUID
    // - Linux: /sys/class/dmi/id/product_uuid (requires root)
    #[cfg(not(target_os = "windows"))]
    {
        Err("Hardware UUID is only implemented for Windows".into())
    }
}

/// Retrieves a unique OS installation identifier for Windows and Linux.
///
/// - Returns a system-unique identifier that persists across reboots and is specific to the OS installation.
/// - Works with both physical machines and VMs.
///
/// # Platform-specific behavior
/// - **Windows**: Returns `MachineGuid` from the registry (GUID format).
/// - **Linux**: Returns `machine-id` from systemd (32-char hex string).
///
/// # Returns
/// - `Ok(String)`: The unique installation identifier.
/// - `Err(String)`: Error message if the identifier cannot be retrieved.
#[tauri::command]
pub fn get_os_installation_id() -> Result<String, String> {
    // Windows implementation using registry
    #[cfg(target_os = "windows")]
    {
        use winreg::enums::*;
        use winreg::RegKey;

        let key = RegKey::predef(HKEY_LOCAL_MACHINE)
            .open_subkey("SOFTWARE\\Microsoft\\Cryptography")
            .map_err(|e| format!("Cannot open registry key: {}", e))?;

        let guid: String = key
            .get_value("MachineGuid")
            .map_err(|e| format!("Cannot read MachineGuid: {}", e))?;

        Ok(guid)
    }

    // Linux implementation using machine-id
    #[cfg(target_os = "linux")]
    {
        use std::fs;

        // Try primary location (systemd standard)
        if let Ok(guid) = fs::read_to_string("/etc/machine-id") {
            return Ok(guid.trim().to_string());
        }

        // Fallback to D-Bus location
        if let Ok(guid) = fs::read_to_string("/var/lib/dbus/machine-id") {
            return Ok(guid.trim().to_string());
        }

        Err("Cannot read machine-id from /etc/machine-id or /var/lib/dbus/machine-id".into())
    }

    // Unsupported platforms
    #[cfg(not(any(target_os = "windows", target_os = "linux")))]
    {
        Err("OS installation GUID is only available on Windows and Linux".into())
    }
}
