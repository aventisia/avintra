use tauri::Manager;

mod commands;
mod runner_management;
mod updater_commands;
mod websocket;

// Import PendingUpdate (the wrapper) instead of the raw UpdateState
use updater_commands::PendingUpdate;

// IMPORTANT NOTE: keep in sync with width/height in tauri.conf.json.
const MAIN_WINDOW_WIDTH: f64 = 1280.0;
const MAIN_WINDOW_HEIGHT: f64 = 800.0;

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
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::launch_runner_app,
            commands::launch_ui_inspector,
            commands::get_user_metadata,
            runner_management::check_runner_app,
            runner_management::download_runner_app,
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
            if let Some(window) = app.get_webview_window("main") {
                let version = env!("CARGO_PKG_VERSION"); // reads version from Cargo.toml
                let current_title = window.title().unwrap_or_default();
                let new_title = format!("{current_title} v{version}");
                let _ = window.set_title(&new_title);
                let small_screen = window
                    .current_monitor()
                    .ok()
                    .flatten()
                    .map(|monitor| {
                        let scale = monitor.scale_factor();
                        let size = monitor.work_area().size;
                        size.width as f64 / scale < MAIN_WINDOW_WIDTH
                            || size.height as f64 / scale < MAIN_WINDOW_HEIGHT
                    })
                    .unwrap_or(true);
                if small_screen {
                    let _ = window.maximize();
                }
            } else {
                eprintln!("Warning: main window not found during setup");
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
