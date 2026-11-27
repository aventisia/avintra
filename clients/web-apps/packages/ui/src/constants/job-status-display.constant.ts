import {
  ArrowClockwiseIcon,
  BroomIcon,
  CheckCircleIcon,
  HourglassIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  ProhibitIcon,
  QuestionIcon,
  StopCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";

import type { BadgeProps } from "../components/badge";
import { JobStatusEnum } from "../enums/job-status.enum";
import type { IconProps } from "../types";

export type JobStatusTone = "ok" | "live" | "warn" | "bad" | "neutral";

export type JobStatusDisplay = {
  label: string;
  tone: JobStatusTone;
  Icon: ComponentType<IconProps>;
};

/**
 * The one job status vocabulary, shared by the workspace Jobs page and Studio's run log.
 */
export const STATUS_DISPLAY: Record<JobStatusEnum, JobStatusDisplay> = {
  [JobStatusEnum.Created]: { label: "Created", tone: "neutral", Icon: HourglassIcon },
  [JobStatusEnum.Running]: { label: "Running", tone: "live", Icon: PlayCircleIcon },
  [JobStatusEnum.Resumed]: { label: "Resumed", tone: "live", Icon: PlayCircleIcon },
  [JobStatusEnum.Retrying]: { label: "Retrying", tone: "live", Icon: ArrowClockwiseIcon },
  [JobStatusEnum.Cleanup]: { label: "Cleanup", tone: "live", Icon: BroomIcon },
  [JobStatusEnum.Paused]: { label: "Paused", tone: "warn", Icon: PauseCircleIcon },
  [JobStatusEnum.Completed]: { label: "Completed", tone: "ok", Icon: CheckCircleIcon },
  [JobStatusEnum.Failed]: { label: "Failed", tone: "bad", Icon: XCircleIcon },
  [JobStatusEnum.Aborted]: { label: "Aborted", tone: "bad", Icon: StopCircleIcon },
  [JobStatusEnum.Killed]: { label: "Killed", tone: "bad", Icon: StopCircleIcon },
  [JobStatusEnum.Canceled]: { label: "Canceled", tone: "neutral", Icon: ProhibitIcon },
};

/** Neutral fallback for legacy rows whose status predates the current vocabulary. */
export const FALLBACK_STATUS_DISPLAY: JobStatusDisplay = {
  label: "Unknown",
  tone: "neutral",
  Icon: QuestionIcon,
};

export const statusVariant: { [key in JobStatusEnum]: BadgeProps["variant"] } = {
  [JobStatusEnum.Completed]: "completed",
  [JobStatusEnum.Running]: "running",
  [JobStatusEnum.Aborted]: "failed",
  [JobStatusEnum.Canceled]: "secondary",
  [JobStatusEnum.Cleanup]: "running",
  [JobStatusEnum.Paused]: "queued",
  [JobStatusEnum.Resumed]: "running",
  [JobStatusEnum.Retrying]: "running",
  [JobStatusEnum.Created]: "queued",
  [JobStatusEnum.Failed]: "failed",
  [JobStatusEnum.Killed]: "failed",
};
