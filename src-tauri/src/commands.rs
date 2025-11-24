use std::process::Command;

#[tauri::command]
pub fn launch_desktop_executor(ws_port: u16, agent_id: String, agent_name: String, access_token: String) -> Result<(), String> {
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

// Machine identification utilities for Windows systems.
//
// This module provides functions to retrieve unique hardware and software identifiers
// from Windows machines. These can be used for device fingerprinting,
// licensing, or system identification purposes.

// Retrieves the system's hardware UUID from the BIOS/UEFI firmware.
//
// This function queries the Win32_ComputerSystemProduct WMI class to get the
// universally unique identifier (UUID) assigned by the hardware manufacturer.
// The UUID is burned into the system's BIOS/UEFI firmware and persists across
// OS reinstalls.
//
// Use this when you need a persistent hardware identifier that survives
// OS reinstalls, disk replacements, and system resets.
//
// Platform Support:
// - Windows: Fully supported via PowerShell and WMI
// - Other platforms: Returns an error (not yet implemented)
//
// How it works:
// 1. Executes a PowerShell command with minimal profile loading for speed
// 2. Queries WMI for the system product UUID
// 3. Validates and returns the cleaned UUID string
//
// Returns:
// - Ok(String): The hardware UUID (e.g., "12345678-ABCD-1234-ABCD-123456789012")
// - Err(String): Description of what went wrong
//
// Errors:
// This function will return an error if:
// - PowerShell fails to execute (permissions, missing binary, etc.)
// - The WMI query fails or returns no data
// - The UUID string is empty or invalid
//
// Security Considerations:
// - Requires PowerShell execution rights
// - May require elevated privileges depending on system configuration
// - The UUID is a persistent hardware identifier that survives OS reinstalls
//
// Example:
// ```
// match get_hardware_uuid() {
//     Ok(uuid) => println!("Hardware UUID: {}", uuid),
//     Err(e) => eprintln!("Failed to get hardware UUID: {}", e),
// }
// ```
#[command]
pub fn get_hardware_uuid() -> Result<String, String> {
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

// Retrieves a unique OS installation identifier for Windows and Linux.
// 
// This function returns a system-unique identifier that persists across reboots
// and is specific to the OS installation. Works with both physical machines and VMs.
// 
// # Platform-specific behavior:
// - **Windows**: Returns MachineGuid from registry (GUID format)
// - **Linux**: Returns machine-id from systemd (32-char hex string)
// 
// # Returns
// - `Ok(String)`: The unique installation identifier
// - `Err(String)`: Error message if the identifier cannot be retrieved
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