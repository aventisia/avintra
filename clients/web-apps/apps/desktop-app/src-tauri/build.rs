fn main() {
    // Autogenerate `allow-<command>` / `deny-<command>` ACL permissions for the
    // app's own commands. Without this, custom commands registered only via
    // invoke_handler are not exposed through the ACL and get blocked for remote
    // origins (e.g. the dev server at http://localhost:2999) with
    // "Command X not allowed by ACL".
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "launch_runner_app",
            "launch_ui_inspector",
            "get_user_metadata",
            "check_runner_app",
            "download_runner_app",
            "get_websocket_port",
            "check_update_for_domain",
            "download_update",
            "install_update",
            "cancel_download",
            "get_app_version",
            "has_pending_update",
        ]),
    ))
    .unwrap();
}
