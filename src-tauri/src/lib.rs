use tauri::Manager;
use tokio::sync::Mutex;

mod commands;
mod updater_commands;
mod websocket;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize the websocket server
    tauri::async_runtime::spawn(async {
        websocket::start_websocket_server().await;
    });

    // Initialize the Tauri application
    tauri::Builder::default()
        .manage(updater_commands::PendingUpdate(Mutex::new(None)))
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            commands::launch_desktop_executor,
            commands::launch_ui_inspector,
            commands::get_user_metadata,
            websocket::get_websocket_port,
            // updater commands
            updater_commands::check_update_for_domain,
            updater_commands::install_pending_update,
            updater_commands::cancel_pending_update,
            updater_commands::get_app_version,
            updater_commands::has_pending_update,
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
