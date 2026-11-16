import { JobStatusEnum } from "../enums/job-status-enum";

export interface LogEntry {
  id: string;
  time: string;
  duration: number;
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
