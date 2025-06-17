use tauri::Manager;
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
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
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

            // Set tauri window title with version
            let window = app.get_webview_window("main").unwrap();
            let version = env!("CARGO_PKG_VERSION"); // reads version from Cargo.toml
            let new_title = format!("Worc v{}", version);
            window.set_title(&new_title).unwrap();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
