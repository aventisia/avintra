use tauri::Manager;

mod commands;
mod executor_management;
mod updater_commands;
mod websocket;

// Import PendingUpdate (the wrapper) instead of the raw UpdateState
use updater_commands::PendingUpdate;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize the websocket server
    tauri::async_runtime::spawn(async {
        websocket::start_websocket_server().await;
    });

    // Initialize the Tauri application
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        // Register the PendingUpdate wrapper so commands can find it
        .manage(PendingUpdate::new())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            commands::launch_desktop_executor,
            commands::launch_ui_inspector,
            commands::get_user_metadata,
            executor_management::ensure_desktop_executor,
            executor_management::install_desktop_executor_service,
            executor_management::uninstall_desktop_executor_service,
            executor_management::get_desktop_executor_version,
            websocket::get_websocket_port,
            // updater commands
            updater_commands::check_update_for_domain,
            updater_commands::download_update,
            updater_commands::install_update,
            updater_commands::cancel_download,
            updater_commands::get_app_version,
            updater_commands::has_pending_update
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
                                                     // Get the current title
            let current_title = window.title().unwrap_or_else(|_| String::from(""));
            let new_title = format!("{current_title} v{version}");
            window.set_title(&new_title).unwrap();
            window.maximize().unwrap();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
