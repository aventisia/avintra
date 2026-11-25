import { JobStatusEnum } from "@avplatform/ui/enums";

export interface LogEntry {
  id: string;
  time: string;
  duration: number;
  /** True when the run has ended; a run without an end time has no duration yet. */
  hasEndTime: boolean;
  status: JobStatusEnum;
  user: {
    name: string;
    initials: string;
    avatar?: string;
  };
}

export interface DaySection {
  date: string;
  /** Start time (ms) of the section's newest run, used for relative day labels. */
  startedAt: number;
  entries: LogEntry[];
}
