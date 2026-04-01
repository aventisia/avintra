export interface HistoryEntry {
  id: string;
  time: string;
  user: {
    name: string;
    initials: string;
    avatar?: string;
  };
}

export interface DaySection {
  date: string;
  dateFormatted: string;
  entries: HistoryEntry[];
}