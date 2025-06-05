mod commands;
mod websocket;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize the websocket server
    tauri::async_runtime::spawn(async {
        websocket::start_websocket_server().await;
    });

    // Initialize the Tauri application
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::launch_desktop_executor,
            commands::launch_ui_inspector
        ])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
