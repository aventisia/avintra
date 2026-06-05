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
 fn get_machine_hardware_uuid() -> Result<String, String> {
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
