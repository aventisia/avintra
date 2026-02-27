use serde::Serialize;
use std::sync::atomic::{AtomicU64, AtomicU8, Ordering};
use std::sync::Arc;
use tauri::async_runtime::JoinHandle;
use tauri::{ipc::Channel, AppHandle, State, Url};
use tauri_plugin_updater::{Update, UpdaterExt};
use tokio::sync::Mutex;

/* STATE MANAGEMENT
 */

/**
 * Manages the lifecycle of an update operation.
 * * - `update`: The metadata of the update found during the check phase.
 * - `content`: The actual binary bytes, stored here after a successful download.
 * - `download_task`: A handle to the background download task, allowing cancellation.
 */
pub struct UpdateState {
    pub update: Option<Update>,
    pub content: Option<Vec<u8>>,
    pub download_task: Option<JoinHandle<()>>,
}

impl UpdateState {
    pub fn new() -> Self {
        Self {
            update: None,
            content: None,
            download_task: None,
        }
    }
}

/**
 * Thread-safe wrapper for the update state.
 * Shared across commands (check, download, install).
 */
pub struct PendingUpdate(pub Arc<Mutex<UpdateState>>);

impl PendingUpdate {
    pub fn new() -> Self {
        Self(Arc::new(Mutex::new(UpdateState::new())))
    }
}

/* DATA STRUCTS (Sent to Frontend)
 */

#[derive(Serialize, Clone)]
pub struct UpdateMetadata {
    pub available: bool,
    /// Indicates if the binary is already downloaded and ready to install.
    pub downloaded: bool,
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
    pub downloaded: u64,        // cumulative bytes downloaded so far
    pub total: Option<u64>,     // total size if known
    pub percentage: u8,         // best-effort percentage (0–100)
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

/* COMMAND: CHECK UPDATE
 */

/**
 * Checks for updates for the specific domain.
 * * Logic:
 * 1. Constructs the update URL dynamically based on the domain.
 * 2. Checks against the server.
 * 3. If an update is found:
 * - Checks if we already have *this specific version* downloaded in memory.
 * - If it's a new version, it resets the state (clears old downloads).
 * - If it's the same version we have in memory, it preserves the 'downloaded' state.
 */
#[tauri::command]
pub async fn check_update_for_domain(
    app: AppHandle,
    state: State<'_, PendingUpdate>,
    domain: String,
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

    let url =
        Url::parse(&endpoint).map_err(|e| UpdateError::new("URL_PARSE_ERROR", e.to_string()))?;

    // Build updater dynamically so we can control the endpoint
    let update = app
        .updater_builder()
        .endpoints(vec![url])
        .map_err(|e| UpdateError::new("BUILDER_ERROR", e.to_string()))?
        .build()
        .map_err(|e| UpdateError::new("BUILD_ERROR", e.to_string()))?
        .check()
        .await
        .map_err(|e| UpdateError::new("CHECK_ERROR", e.to_string()))?;

    let mut state_lock = state.0.lock().await;

    if let Some(update) = update {
        // Smart Check: Do we already have this version?
        let already_downloaded = if let Some(existing) = &state_lock.update {
            existing.version == update.version && state_lock.content.is_some()
        } else {
            false
        };

        if !already_downloaded {
            // Reset state only if the version has changed
            if state_lock.update.as_ref().map(|u| &u.version) != Some(&update.version) {
                state_lock.update = Some(update.clone());
                state_lock.content = None;
            }
        }

        Ok(UpdateMetadata {
            available: true,
            downloaded: state_lock.content.is_some(),
            version: update.version.clone(),
            current_version,
            notes: update.body.clone(),
            date: update.date.as_ref().map(|d| d.to_string()),
            download_url: Some(update.download_url.to_string()),
        })
    } else {
        // Clear state if no update is available (e.g. user rolled back or server changed)
        *state_lock = UpdateState::new();
        Ok(UpdateMetadata {
            available: false,
            downloaded: false,
            version: current_version.clone(),
            current_version,
            notes: None,
            date: None,
            download_url: None,
        })
    }
}

/* COMMAND: DOWNLOAD
 */

/**
 * Initiates the download process in a background task.
 * * - Spawns an async task (abortable via `cancel_download`).
 * - Streams progress back to the UI via the `on_progress` channel.
 * - Stores the resulting binary in `state.content` upon success.
 */
#[tauri::command]
pub async fn download_update(
    state: State<'_, PendingUpdate>,
    on_progress: Channel<DownloadProgress>,
) -> Result<(), UpdateError> {
    // Preparation: Get the update object and clone the state ARC for the background task
    let (update, state_arc) = {
        let lock = state.0.lock().await;

        // Fast exit: if already downloaded, just notify UI
        if lock.content.is_some() {
            let _ = on_progress.send(DownloadProgress {
                downloaded: 0,
                total: None,
                percentage: 100,
                status: ProgressStatus::Downloaded,
            });
            return Ok(());
        }

        let update = lock
            .update
            .clone()
            .ok_or_else(|| UpdateError::new("NO_UPDATE", "No pending update"))?;
        (update, state.0.clone())
    };

    let progress_channel = on_progress.clone();
    let error_channel = on_progress.clone();
    let finish_channel = on_progress.clone();

    // Spawn: Run download in background so it doesn't block the main thread
    let task = tauri::async_runtime::spawn(async move {
        let _ = on_progress.send(DownloadProgress {
            downloaded: 0,
            total: None,
            percentage: 0,
            status: ProgressStatus::Pending,
        });

        // Atomic counters for thread-safe progress tracking
        let downloaded_bytes = Arc::new(AtomicU64::new(0));
        let total_bytes = Arc::new(AtomicU64::new(0));
        let last_sent_percentage = Arc::new(AtomicU8::new(255));
        let last_sent_bytes = Arc::new(AtomicU64::new(0));

        let download_result = update
            .download(
                {
                    let downloaded_bytes = downloaded_bytes.clone();
                    let total_bytes = total_bytes.clone();
                    let last_pct = last_sent_percentage.clone();
                    let last_bytes = last_sent_bytes.clone();
                    let progress_channel = progress_channel.clone();

                    // Progress Callback
                    move |chunk_length, total_opt| {
                        let chunk = chunk_length as u64;
                        let cumulative =
                            downloaded_bytes.fetch_add(chunk, Ordering::Relaxed) + chunk;

                        if let Some(total) = total_opt {
                            total_bytes.store(total as u64, Ordering::Relaxed);
                        }
                        let total = total_bytes.load(Ordering::Relaxed);
                        let total_opt = if total > 0 { Some(total) } else { None };

                        let percentage = if total > 0 {
                            (((cumulative as f64) / (total as f64)) * 100.0).min(99.0) as u8
                        } else {
                            0
                        };

                        // Throttling: Only send updates if % changed significantly or bytes > 2MB
                        // This prevents spamming the frontend channel
                        let pct_delta = percentage.saturating_sub(last_pct.load(Ordering::Relaxed));
                        let byte_delta =
                            cumulative.saturating_sub(last_bytes.load(Ordering::Relaxed));

                        if last_pct.load(Ordering::Relaxed) == 255
                            || pct_delta >= 2
                            || byte_delta >= 2_000_000
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
                || {}, // on_download_finish (handled in the match block below)
            )
            .await;

        match download_result {
            Ok(bytes) => {
                // Success: Store the bytes in state
                let mut lock = state_arc.lock().await;
                lock.content = Some(bytes);
                lock.download_task = None;

                // Notify UI: Ready to Install
                let _ = finish_channel.send(DownloadProgress {
                    downloaded: downloaded_bytes.load(Ordering::Relaxed),
                    total: None,
                    percentage: 100,
                    status: ProgressStatus::Downloaded,
                });
            }
            Err(e) => {
                // Failure: Notify UI
                let _ = error_channel.send(DownloadProgress {
                    downloaded: 0,
                    total: None,
                    percentage: 0,
                    status: ProgressStatus::Error,
                });
                println!("[updater] Download failed: {}", e);
            }
        }
    });

    // Save task handle to allow cancellation
    state.0.lock().await.download_task = Some(task);
    Ok(())
}

/* COMMAND: INSTALL
 */

/**
 * Consumes the downloaded binary and installs the update.
 * * - Requires `content` to be present in state.
 * - Restarts the app automatically on success.
 */
#[tauri::command]
pub async fn install_update(
    app: AppHandle,
    state: State<'_, PendingUpdate>,
    on_progress: Channel<DownloadProgress>,
) -> Result<(), UpdateError> {
    let (update, bytes) = {
        let mut lock = state.0.lock().await;
        // Take ownership of bytes (consumes the download)
        let bytes = lock
            .content
            .take()
            .ok_or_else(|| UpdateError::new("NO_DOWNLOAD", "Update not downloaded"))?;
        let update = lock
            .update
            .clone()
            .ok_or_else(|| UpdateError::new("NO_UPDATE", "No pending update"))?;
        (update, bytes)
    };

    let _ = on_progress.send(DownloadProgress {
        downloaded: 0,
        total: None,
        percentage: 100,
        status: ProgressStatus::Installing,
    });

    // Run the actual installation
    if let Err(e) = update.install(bytes) {
        let _ = on_progress.send(DownloadProgress {
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

/* COMMAND: UTILS
 */

/**
 * Aborts the current download task if it exists.
 */
#[tauri::command]
pub async fn cancel_download(state: State<'_, PendingUpdate>) -> Result<(), UpdateError> {
    let mut lock = state.0.lock().await;
    if let Some(task) = lock.download_task.take() {
        task.abort();
        println!("[updater] Download task aborted");
    }
    // Clean up partial downloads
    lock.content = None;
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
    Ok(state.0.lock().await.update.is_some())
}
