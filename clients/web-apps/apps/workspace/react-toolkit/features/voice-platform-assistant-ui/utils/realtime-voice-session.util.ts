/** Maximum silent reconnect attempts before a blocking error is shown to the user. */
export const REALTIME_RECONNECT_MAX_ATTEMPTS = 5;

/** Exponential backoff for silent reconnects: ~1s → 8s. */
export const realtimeReconnectDelayMs = (attempt: number): number =>
  Math.min(1000 * 2 ** Math.max(0, attempt - 1), 8000);

export type RealtimeCloseDisposition = "stopped" | "silent-reconnect" | "blocking";

export const REALTIME_BLOCKING_CLOSE_CODES = [4400, 4401, 4403] as const;

const TRANSIENT_CLOSE_CODES = [1006, 1011];

/** Classifies a realtime socket close into stop, silent retry, or a blocking failure. */
export const classifyRealtimeClose = (code: number): RealtimeCloseDisposition => {
  if (code === 1000) return "stopped";
  if (TRANSIENT_CLOSE_CODES.includes(code)) return "silent-reconnect";
  return "blocking";
};

export type RealtimeSessionErrorContext = {
  code: number;
  provider: string;
  model: string;
  mode: string;
  message?: string;
};

/** Builds the user-facing blocking error naming the provider, model, and mode. */
export const realtimeSessionErrorMessage = ({
  code,
  provider,
  model,
  mode,
  message,
}: RealtimeSessionErrorContext): string => {
  const target = `${provider || "unknown provider"}/${model || "unknown model"} (${mode} mode)`;

  if (code === 4401) {
    return `Realtime voice authentication failed for ${target}. Sign in again and retry.`;
  }

  if (code === 4403) {
    return `Realtime voice is not enabled for ${target}. Enable the model for the Realtime capability or check the credentials.`;
  }

  if (code === 4400) {
    return `Realtime voice configuration for ${target} is not supported. ${
      message ?? "Select a supported provider and model before retrying."
    }`;
  }

  return message ?? `Realtime voice failed for ${target}.`;
};

/** A pipeline switch is offered only as a suggestion the user must confirm. */
export const shouldSuggestPipelineSwitch = (disposition: RealtimeCloseDisposition): boolean =>
  disposition === "blocking";
