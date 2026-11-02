import type { Platform } from "../utils/detect-platform.util";

export const DESKTOP_DOWNLOAD_ROUTE = "/download";

export const PLATFORM_LABELS: Record<Platform, string> = {
  windows: "Windows",
  macos: "macOS",
  linux: "Linux",
};

export const PLATFORMS = Object.keys(PLATFORM_LABELS) as Platform[];

export const RUNNER_INSTALL_SECTION_ID = "install-runner";

const RUNNER_SERVICE_NAME = "AvintraRunnerService";

export const RUNNER_COMMANDS = {
  allowScripts: "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser",
  verify: `sc.exe qc ${RUNNER_SERVICE_NAME}\nsc.exe query ${RUNNER_SERVICE_NAME}`,
  restart: `net stop ${RUNNER_SERVICE_NAME}\nnet start ${RUNNER_SERVICE_NAME}`,
  stop: `net stop ${RUNNER_SERVICE_NAME}`,
  uninstall: [
    `cd "C:\\Program Files\\${RUNNER_SERVICE_NAME}"`,
    `.\\${RUNNER_SERVICE_NAME}.exe --uninstall`,
    "cd ..",
    `Remove-Item -Recurse -Force "C:\\Program Files\\${RUNNER_SERVICE_NAME}"`,
  ].join("\n"),
};
