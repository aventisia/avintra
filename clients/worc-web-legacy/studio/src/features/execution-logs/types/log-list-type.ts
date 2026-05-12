import { JobStatusTypesEnum } from "../enums/job-status-type-enum";

export interface LogEntry {
  id: string;
  time: string;
  duration: number;
  status: JobStatusTypesEnum;
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
