export interface LogEntry {
  id: string;
  time: string;
  duration: number;
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
