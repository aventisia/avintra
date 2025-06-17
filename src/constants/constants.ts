/**
 * Indicates whether the application is running in a Tauri environment.
 *
 * This constant checks if the `window` object contains the `isTauri` property,
 * which is typically injected by Tauri. It can be used to conditionally execute
 * code specific to Tauri or web environments.
 */
const IS_TAURI = "isTauri" in window;

export { IS_TAURI };
