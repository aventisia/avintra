import { IS_TAURI } from "@/constants/constants";
import { ClientTypesEnum } from "@/enums/client-type-enum";

/**
 * Generates the WebSocket URL required to establish a connection.
 * The URL includes the app's version, the hostname, the OS ID, and the client type.
 * The client type is determined based on whether the app is running in Tauri or a web browser.
 *
 * @param {Object} params - The parameters needed to build the WebSocket URL.
 * @param {string} params.appVersion - The version of the app making the WebSocket connection (optional, for Tauri only).
 * @param {string} params.hostname - The hostname of the machine or app instance (optional, for Tauri only).
 * @param {string} params.osID - The unique OS ID of the machine (optional, for Tauri only).
 *
 * @returns {string} The complete WebSocket URL with all the necessary query parameters.
 */
export const getWebSocketUrl = ({
  appVersion,
  hostname,
  osID,
}: {
  osID: string;
  hostname: string;
  appVersion: string;
}) => {
  // Determine the client type based on whether the app is running in Tauri or a web browser
  const clientType = IS_TAURI
    ? ClientTypesEnum.AvPlatformDesktopApp
    : ClientTypesEnum.WebBrowser;

  // Construct the WebSocket URL
  let url = `${import.meta.env.VITE_WORKSPACE_API_PATH}/orchestrator-hub?clientType=${clientType}`;

  // Only include osID, hostname, and appVersion if the app is in Tauri (i.e., IS_TAURI is true)
  if (IS_TAURI) {
    url += `&osId=${osID}&hostname=${hostname}&appVersion=${appVersion}`;
  }

  return url;
};
