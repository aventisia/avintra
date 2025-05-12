use std::process::Command;

#[tauri::command]
pub fn launch_desktop_executor(agent_name: String, agent_id: String, jwt: String) -> Result<(), String> {
    // Node executor path
    let node_executor_path = r"C:\Users\Gaurav Kumar\source\repos\NodeExecutor\bin\Debug\NodeExecutor.exe";

    Command::new(node_executor_path)
        .arg(agent_name)
        .arg(agent_id)
        .arg(jwt)
        .spawn()
        .map_err(|e| format!("Failed to start the executor: {}", e))?;
    Ok(())
}