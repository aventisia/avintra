use std::process::Command;

#[tauri::command]
pub fn launch_desktop_executor(agent_name: String) -> Result<(), String> {
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
        .arg(agent_name)
        .spawn()
        .map_err(|e| format!("Failed to start the executor: {}", e))?;
    Ok(())
}

#[tauri::command]
pub fn launch_ui_inspector() -> Result<(), String> {
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
        .spawn()
        .map_err(|e| format!("Failed to start the inspector: {}", e))?;
    Ok(())
}
