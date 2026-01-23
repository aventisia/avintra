use serde::Serialize;
use std::sync::atomic::{ AtomicU64, AtomicU8, Ordering };
use std::sync::Arc;
use tauri::{ ipc::Channel, AppHandle, State, Url };
use tauri_plugin_updater::{ Update, UpdaterExt };
use tokio::sync::Mutex;

/* 
STATE
 */

/**
 * Holds a single pending update between:
 *   1) check_update_for_domain
 *   2) install_pending_update
 *
 * Why Mutex<Option<Update>>?
 * - Update is not Copy and cannot be cloned freely
 * - Only ONE install should ever happen per update
 * - Once installation starts, we "take" the update out
 *   so it cannot be installed again accidentally
 */
pub struct PendingUpdate(pub Mutex<Option<Update>>);

/* 
DATA STRUCTS (sent to React)
 */

#[derive(Serialize, Clone)]
pub struct UpdateMetadata {
    pub available: bool,
    pub version: String,
    pub current_version: String,
    pub notes: Option<String>,
    pub date: Option<String>,
    pub download_url: Option<String>,
}

/**
 * Represents the updater progress as the UI understands it.
 * This object is streamed continuously to React via IPC.
 */
#[derive(Serialize, Clone, Debug)]
pub struct DownloadProgress {
    pub downloaded: u64, // cumulative bytes downloaded so far
    pub total: Option<u64>, // total size if known
    pub percentage: u8, // best-effort percentage (0–100)
    pub status: ProgressStatus, // current phase of update lifecycle
}

/**
 * IMPORTANT:
 * These enum names must exactly match the
 * TypeScript union used in React.
 */
#[derive(Serialize, Clone, Debug)]
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

/* 
COMMAND: CHECK UPDATE
 */

/**
 * Checks whether an update is available for the given domain.
 *
 * This does NOT install anything.
 * It only:
 * - contacts the update endpoint
 * - stores the Update internally if one exists
 * - returns metadata for UI display
 */
#[tauri::command]
pub async fn check_update_for_domain(
    app: AppHandle,
    state: State<'_, PendingUpdate>,
    domain: String
) -> Result<UpdateMetadata, UpdateError> {
    let current_version = app.package_info().version.to_string();

    // Normalize domain to avoid issues with protocol or trailing slashes
    let domain = domain
        .trim()
        .trim_start_matches("https://")
        .trim_start_matches("http://")
        .trim_end_matches('/');

    // {{target}}, {{arch}}, {{current_version}} are replaced internally by Tauri
    let endpoint =
        format!("https://{}/accounts/api/desktop-app/update/{{{{target}}}}/{{{{arch}}}}/{{{{current_version}}}}", domain);

    println!("[updater] checking update at {}", endpoint);

    let url = Url::parse(&endpoint).map_err(|e|
        UpdateError::new("URL_PARSE_ERROR", e.to_string())
    )?;

    // Build updater dynamically so we can control the endpoint
    let update = app
        .updater_builder()
        .endpoints(vec![url])
        .map_err(|e| UpdateError::new("BUILDER_ERROR", e.to_string()))?
        .build()
        .map_err(|e| UpdateError::new("BUILD_ERROR", e.to_string()))?
        .check().await
        .map_err(|e| UpdateError::new("CHECK_ERROR", e.to_string()))?;

    if let Some(update) = update {
        println!("[updater] update available: {} → {}", current_version, update.version);

        // Store update in memory so install command can use it later
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

/*
   COMMAND: INSTALL UPDATE
   */

/**
 * Downloads and installs the previously checked update.
 *
 * Key guarantees:
 * - Can only run if an update was checked first
 * - Can only run ONCE per update
 * - Streams progress to React
 * - Restarts the app after successful install
 */
#[tauri::command]
pub async fn install_pending_update(
    app: AppHandle,
    state: State<'_, PendingUpdate>,
    on_progress: Channel<DownloadProgress>
) -> Result<(), UpdateError> {
    println!("[updater] install_pending_update called");

    // Take ownership of the update.
    // After this, no other install attempt is possible.
    let update = state.0
        .lock().await
        .take()
        .ok_or_else(|| UpdateError::new("NO_UPDATE", "No pending update"))?;

    // Notify UI that preparation has started
    let _ = on_progress.send(DownloadProgress {
        downloaded: 0,
        total: None,
        percentage: 0,
        status: ProgressStatus::Pending,
    });

    /*
       Progress tracking model

       The updater callback only provides:
       - size of the CURRENT chunk
       - optional total size

       It does NOT provide cumulative progress.
       We calculate cumulative values here purely for UI.
    */

    let downloaded_bytes = Arc::new(AtomicU64::new(0));
    let total_bytes = Arc::new(AtomicU64::new(0));

    // Used to throttle progress updates sent to the UI
    let last_sent_percentage = Arc::new(AtomicU8::new(255)); // sentinel value
    let last_sent_bytes = Arc::new(AtomicU64::new(0));

    let progress_channel = on_progress.clone();
    let finish_channel = on_progress.clone();
    let error_channel = on_progress.clone();

    let result = update.download_and_install(
        {
            let downloaded_bytes = downloaded_bytes.clone();
            let total_bytes = total_bytes.clone();
            let last_pct = last_sent_percentage.clone();
            let last_bytes = last_sent_bytes.clone();

            move |chunk_length, total_opt| {
                // Accumulate downloaded bytes
                let chunk = chunk_length as u64;
                let cumulative = downloaded_bytes.fetch_add(chunk, Ordering::Relaxed) + chunk;

                // Store total size if provided
                if let Some(total) = total_opt {
                    total_bytes.store(total as u64, Ordering::Relaxed);
                }

                let total = total_bytes.load(Ordering::Relaxed);
                let total_opt = if total > 0 { Some(total) } else { None };

                // Percentage is best-effort and capped below 100 during download
                let percentage = if total > 0 {
                    (((cumulative as f64) / (total as f64)) * 100.0).min(99.0) as u8
                } else {
                    0
                };

                // Reduce UI noise by sending updates only when meaningful
                let pct_delta = percentage.saturating_sub(last_pct.load(Ordering::Relaxed));
                let byte_delta = cumulative.saturating_sub(last_bytes.load(Ordering::Relaxed));

                if
                    last_pct.load(Ordering::Relaxed) == 255 ||
                    pct_delta >= 5 ||
                    byte_delta >= 5_242_880
                {
                    last_pct.store(percentage, Ordering::Relaxed);
                    last_bytes.store(cumulative, Ordering::Relaxed);

                    let _ = progress_channel.send(DownloadProgress {
                        downloaded: cumulative,
                        total: total_opt,
                        percentage,
                        status: ProgressStatus::Downloading,
                    });
                }
            }
        },
        {
            let downloaded_bytes = downloaded_bytes.clone();
            let total_bytes = total_bytes.clone();

            move || {
                let downloaded = downloaded_bytes.load(Ordering::Relaxed);
                let total = total_bytes.load(Ordering::Relaxed);
                let total_opt = if total > 0 { Some(total) } else { None };

                // Download finished, installation is about to start
                let _ = finish_channel.send(DownloadProgress {
                    downloaded,
                    total: total_opt,
                    percentage: 100,
                    status: ProgressStatus::Downloaded,
                });

                let _ = finish_channel.send(DownloadProgress {
                    downloaded,
                    total: total_opt,
                    percentage: 100,
                    status: ProgressStatus::Installing,
                });
            }
        }
    ).await;

    if let Err(e) = result {
        let _ = error_channel.send(DownloadProgress {
            downloaded: 0,
            total: None,
            percentage: 0,
            status: ProgressStatus::Error,
        });

        return Err(UpdateError::new("INSTALL_ERROR", e.to_string()));
    }

    // Final success state
    let _ = on_progress.send(DownloadProgress {
        downloaded: 0,
        total: None,
        percentage: 100,
        status: ProgressStatus::Installed,
    });

    println!("[updater] restarting app");
    app.restart();
}

/* 
MISC COMMANDS
 */

/**
 * Clears any pending update without installing it.
 */
#[tauri::command]
pub async fn cancel_pending_update(state: State<'_, PendingUpdate>) -> Result<(), UpdateError> {
    *state.0.lock().await = None;
    Ok(())
}

/**
 * Returns the current app version.
 */
#[tauri::command]
pub fn get_app_version(app: AppHandle) -> String {
    app.package_info().version.to_string()
}

/**
 * Indicates whether an update has been checked
 * and is waiting to be installed.
 */
#[tauri::command]
pub async fn has_pending_update(state: State<'_, PendingUpdate>) -> Result<bool, UpdateError> {
    Ok(state.0.lock().await.is_some())
}
