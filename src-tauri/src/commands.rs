use std::process::Command;

#[tauri::command]
pub fn launch_desktop_executor(jwt: String) -> Result<(), String> {
    Command::new("C:\\Windows\\System32\\notepad.exe")
        .arg(jwt)
        .spawn()
        .map_err(|e| format!("Failed to start the executor: {}", e))?;
    Ok(())
}