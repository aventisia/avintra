import { JobStatusEnum } from "../enums/job-status-enum";

type LogLevel = "info" | "done" | "warn" | "error" | "running";

export const STATUS_LEVEL: Record<JobStatusEnum, LogLevel> = {
  [JobStatusEnum.Created]: "info",
  [JobStatusEnum.Paused]: "info",
  [JobStatusEnum.Running]: "running",
  [JobStatusEnum.Resumed]: "running",
  [JobStatusEnum.Retrying]: "running",
  [JobStatusEnum.Cleanup]: "running",
  [JobStatusEnum.Completed]: "done",
  [JobStatusEnum.Aborted]: "warn",
  [JobStatusEnum.Canceled]: "warn",
  [JobStatusEnum.Failed]: "error",
  [JobStatusEnum.Killed]: "error",
};

export const LEVEL_STYLES: Record<LogLevel, { label: string; text: string; shape: string }> = {
  info: { label: "Info", text: "text-muted-foreground", shape: "rounded-full bg-current" },
  done: { label: "Done", text: "text-ok", shape: "rounded-full bg-current" },
  warn: { label: "Warn", text: "text-warn", shape: "rotate-45 rounded-[1px] bg-current" },
  error: { label: "Error", text: "text-bad", shape: "rounded-[1px] bg-current" },
  running: {
    label: "Running",
    text: "text-live",
    shape: "size-[7px] rounded-full border-[1.5px] border-current",
  },
};

export const isErrorStatus = (status: JobStatusEnum) =>
  STATUS_LEVEL[status] === "error" || STATUS_LEVEL[status] === "warn";
