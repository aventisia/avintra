use std::process::Command;

#[tauri::command]
pub fn launch_desktop_executor(agent_name: String) -> Result<(), String> {
    // Get the directory where tauri_app.exe is running
    let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let exe_dir = current_exe
        .parent()
        .ok_or("Failed to get parent directory")?;

    // Assume the WPF tool is in the same folder
    let node_executor_path = exe_dir.join(r"Debug\NodeExecutor.exe");

    if !node_executor_path.exists() {
        return Err(format!("NodeExecutor is not found at: {}", node_executor_path.display()));
    }

    Command::new(node_executor_path)
        .arg(agent_name)
        .spawn()
        .map_err(|e| format!("Failed to start the executor: {}", e))?;
    Ok(())
}