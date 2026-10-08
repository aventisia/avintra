/**
 * Sentinel written to a job's `executionLocation` when the job runs on the cloud instead of a
 * specific machine. The agent (flow version) `supportedPlatform` field uses the same marker, so
 * this is the single source of truth for cloud execution.
 */
export const CLOUD_EXECUTION_LOCATION = "Cloud";

/** Case-insensitive match against the cloud execution marker. */
const isCloudLocation = (value: string): boolean =>
  value.trim().toLowerCase() === CLOUD_EXECUTION_LOCATION.toLowerCase();

/**
 * Returns true when the agent's platform does not allow cloud execution. A null/empty platform is
 * treated as unsupported; the server enforces the same rule.
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
