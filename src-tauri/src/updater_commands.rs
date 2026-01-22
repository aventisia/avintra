use serde::Serialize;
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
    fn new(code: &str, message: String) -> Self {
        Self {
            code: code.to_string(),
            message,
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
        "https://{}/accounts/api/desktop-app/update/{{{{target}}}}/{{{{arch}}}}/{{{{current_version}}}}",domain
    );

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
    let update = state
        .0
        .lock()
        .await
        .take()
        .ok_or_else(|| UpdateError::new("NO_UPDATE", "No pending update".into()))?;

    let mut last_percentage = 0u8;
    let progress = on_progress.clone();
    let finish = on_progress.clone();

    update
        .download_and_install(
            move |downloaded, total| {
                if let Some(total) = total {
                    let percent = ((downloaded as f64 / total as f64) * 100.0) as u8;
                    if percent > last_percentage {
                        last_percentage = percent;
                        let _ = progress.send(DownloadProgress {
                            downloaded: downloaded as u64,
                            total: Some(total as u64),
                            percentage: percent.min(99),
                            status: ProgressStatus::Downloading,
                        });
                    }
                }
            },
            move || {
                let _ = finish.send(DownloadProgress {
                    downloaded: 0,
                    total: None,
                    percentage: 100,
                    status: ProgressStatus::Installing,
                });
            },
        )
        .await
        .map_err(|e| UpdateError::new("INSTALL_ERROR", e.to_string()))?;

    let _ = on_progress.send(DownloadProgress {
        downloaded: 0,
        total: None,
        percentage: 100,
        status: ProgressStatus::Installed,
    });

    app.restart();
    Ok(())
}

#[tauri::command]
pub async fn cancel_pending_update(state: State<'_, PendingUpdate>) -> Result<(), UpdateError> {
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
