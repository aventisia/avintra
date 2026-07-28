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
  dateFormatted: string;
  entries: LogEntry[];
}
