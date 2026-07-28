/**
 * This file is used to store the state of the Tauri updater,
 * such as the URL to redirect to after relaunching the app.
 */
const TAURI_UPDATE_STORE = "update-state.json";

/**
 * The key used to store or retrieve the relaunch URL for the Tauri updater.
 * This constant is typically used in local storage or IPC communication to
 * identify the URL that the application should relaunch to after an update.
 */
const TAURI_RELAUNCH_URL_KEY = "relauchUrl";

export { TAURI_UPDATE_STORE, TAURI_RELAUNCH_URL_KEY };
