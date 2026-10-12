/**
 * Sentinel written to a job's `executionLocation` when the job runs on the cloud instead of a specific machine.
 */
export const CLOUD_EXECUTION_LOCATION = "Cloud";

const isCloudLocation = (value: string): boolean =>
  value.trim().toLowerCase() === CLOUD_EXECUTION_LOCATION.toLowerCase();

/**
 * Returns true when the agent's platform does not allow cloud execution; a null/empty platform is treated as unsupported.
 */
export const isCloudExecutionBlocked = (supportedPlatform?: string): boolean => {
  if (!supportedPlatform) return true;

  return !supportedPlatform.split(",").some(isCloudLocation);
};

/** Helper text shown when the selected agent cannot execute on the cloud. */
export const CLOUD_UNSUPPORTED_DESCRIPTION =
  "Cloud execution is not supported for this agent. Select a machine to execute the job.";

/** Inline validation message shown when cloud is requested for an unsupported agent. */
export const CLOUD_UNSUPPORTED_ERROR = "Cloud execution is not supported for the selected agent.";
