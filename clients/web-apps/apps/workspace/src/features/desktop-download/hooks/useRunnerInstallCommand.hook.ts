import { useUserSessionStore } from "@avplatform/ui/stores";
import { useShallow } from "zustand/react/shallow";

/* IMPORTANT NOTE: The runner calls /accounts/api and /workspace/api on this origin, and the install script resolves the runner zip from the files proxy, so both URLs come from the page origin. */
const getFilesBaseUrl = () => {
  const path = import.meta.env.VITE_FILES_API_PATH ?? "/files";
  return `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;
};

export const useRunnerInstallCommand = () => {
  const { tenantId, email } = useUserSessionStore(
    useShallow((state) => ({
      tenantId: state.userSession?.tenantId,
      email: state.userSession?.email,
    })),
  );

  return [
    `$env:AVINTRA_APP_BASE_URL = "${window.location.origin}"`,
    '$env:AVINTRA_API_KEY = "<API_KEY>"',
    `$env:AVINTRA_TENANT_ID = "${tenantId ?? "<TENANT_ID>"}"`,
    `$env:AVINTRA_LINKED_USERNAME = "${email ?? "<LINKED_USERNAME>"}"`,
    '$scriptPath = Join-Path $env:TEMP "Install-AvintraRunnerService.ps1"',
    `irm "${getFilesBaseUrl()}/scripts/Install-AvintraRunnerService.ps1" -OutFile $scriptPath`,
    "& $scriptPath",
  ].join("\n");
};
