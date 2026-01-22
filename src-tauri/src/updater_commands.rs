use serde::Serialize;
use std::time::{Duration, Instant};
use tauri::Url;
use tauri::{ipc::Channel, AppHandle, State};
use tauri_plugin_updater::{Update, UpdaterExt};
use tokio::sync::Mutex;

// STATE

pub struct PendingUpdate(pub Mutex<Option<Update>>);

// DATA STRUCTS

#[derive(Serialize, Clone)]
pub struct UpdateMetadata {
    pub available: bool,
    pub version: String,
    pub current_version: String,
    pub notes: Option<String>,
    pub date: Option<String>,
    pub download_url: Option<String>,
}

#[derive(Serialize, Clone)]
pub struct DownloadProgress {
    pub downloaded: u64,
    pub total: Option<u64>,
    pub percentage: u8,
    pub status: ProgressStatus,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "UPPERCASE")]
pub enum ProgressStatus {
    Pending,
    Downloading,
    Downloaded,
    Installing,
    Installed,
    Error,
}

#[derive(Serialize)]
pub struct UpdateError {
    pub code: String,
    pub message: String,
}

impl UpdateError {
    fn new(code: &str, message: impl Into<String>) -> Self {
        Self {
            code: code.to_string(),
            message: message.into(),
        }
    }
}

// COMMANDS

#[tauri::command]
pub async fn check_update_for_domain(
    app: AppHandle,
    state: State<'_, PendingUpdate>,
    domain: String,
) -> Result<UpdateMetadata, UpdateError> {
    let current_version = app.package_info().version.to_string();

    let domain = domain
        .trim()
        .trim_start_matches("https://")
        .trim_start_matches("http://")
        .trim_end_matches('/');

    let url = format!(
        "https://{}/accounts/api/desktop-app/update/{{{{target}}}}/{{{{arch}}}}/{{{{current_version}}}}",
        domain
    );

    println!("[updater] checking update at {}", url);

    let update_url =
        Url::parse(&url).map_err(|e| UpdateError::new("URL_PARSE_ERROR", e.to_string()))?;

    let update = app
        .updater_builder()
        .endpoints(vec![update_url])
        .map_err(|e| UpdateError::new("BUILDER_ERROR", e.to_string()))?
        .build()
        .map_err(|e| UpdateError::new("BUILD_ERROR", e.to_string()))?
        .check()
        .await
        .map_err(|e| UpdateError::new("CHECK_ERROR", e.to_string()))?;

    if let Some(update) = update {
        println!(
            "[updater] update available: current={} latest={}",
            current_version, update.version
        );

        *state.0.lock().await = Some(update.clone());

        Ok(UpdateMetadata {
            available: true,
            version: update.version.clone(),
            current_version,
            notes: update.body.clone(),
            date: update.date.as_ref().map(|d| d.to_string()),
            download_url: Some(update.download_url.to_string()),
        })
    } else {
        println!("[updater] no update available");

        Ok(UpdateMetadata {
            available: false,
            version: current_version.clone(),
            current_version,
            notes: None,
            date: None,
            download_url: None,
        })
    }
}

#[tauri::command]
pub async fn install_pending_update(
    app: AppHandle,
    state: State<'_, PendingUpdate>,
    on_progress: Channel<DownloadProgress>,
) -> Result<(), UpdateError> {
    println!("[updater] install_pending_update called");

    let update = state
        .0
        .lock()
        .await
        .take()
        .ok_or_else(|| UpdateError::new("NO_UPDATE", "No pending update"))?;

    let _ = on_progress.send(DownloadProgress {
        downloaded: 0,
        total: None,
        percentage: 0,
        status: ProgressStatus::Pending,
    });

    println!("[updater] starting download");

    let mut last_percentage: u8 = 0;
    let mut last_emit = Instant::now();
    let emit_interval = Duration::from_millis(150);

    let progress_channel = on_progress.clone();
    let downloaded_channel = on_progress.clone();
    let installing_channel = on_progress.clone();
    let error_channel = on_progress.clone();

    let result = update
        .download_and_install(
            move |downloaded, total| {
                let downloaded = downloaded as u64;
                let total = total.map(|t| t as u64);

                let percentage = if let Some(total) = total {
                    ((downloaded as f64 / total as f64) * 100.0)
                        .min(100.0)
                        .round() as u8
                } else {
                    0
                };

                if percentage != last_percentage && last_emit.elapsed() >= emit_interval {
                    last_percentage = percentage;
                    last_emit = Instant::now();

                    println!(
                        "[updater] downloading {} / {:?} ({}%)",
                        downloaded, total, percentage
                    );

                    let _ = progress_channel.send(DownloadProgress {
                        downloaded,
                        total,
                        percentage,
                        status: ProgressStatus::Downloading,
                    });
                }
            },
            move || {
                println!("[updater] download completed");

                let _ = downloaded_channel.send(DownloadProgress {
                    downloaded: 0,
                    total: None,
                    percentage: 100,
                    status: ProgressStatus::Downloaded,
                });

                println!("[updater] installing update");

                let _ = installing_channel.send(DownloadProgress {
                    downloaded: 0,
                    total: None,
                    percentage: 100,
                    status: ProgressStatus::Installing,
                });
            },
        )
        .await;

    if let Err(e) = result {
        println!("[updater] install error: {}", e);

        let _ = error_channel.send(DownloadProgress {
            downloaded: 0,
            total: None,
            percentage: 0,
            status: ProgressStatus::Error,
        });

        return Err(UpdateError::new("INSTALL_ERROR", e.to_string()));
    }

    println!("[updater] update installed successfully");

    let _ = on_progress.send(DownloadProgress {
        downloaded: 0,
        total: None,
        percentage: 100,
        status: ProgressStatus::Installed,
    });

    app.restart();
}

#[tauri::command]
pub async fn cancel_pending_update(state: State<'_, PendingUpdate>) -> Result<(), UpdateError> {
    println!("[updater] cancel_pending_update called");
    *state.0.lock().await = None;
    Ok(())
}

#[tauri::command]
pub fn get_app_version(app: AppHandle) -> String {
    app.package_info().version.to_string()
}

#[tauri::command]
pub async fn has_pending_update(state: State<'_, PendingUpdate>) -> Result<bool, UpdateError> {
    Ok(state.0.lock().await.is_some())
}
