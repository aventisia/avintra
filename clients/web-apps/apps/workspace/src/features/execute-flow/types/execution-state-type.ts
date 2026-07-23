export type ExecutionStateType =
  "creating-job" | "launching-executor" | "executing" | "paused" | "stopped";

export const PROCESSING_STATES: readonly ExecutionStateType[] = [
  "creating-job",
  "launching-executor",
  "executing",
  "paused",
];
