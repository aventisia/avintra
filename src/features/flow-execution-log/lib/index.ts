import { format } from "date-fns";

const formatDuration = (sec: number) => {
  const min = Math.floor(sec / 60);
  const secRemain = sec % 60;
  return min > 0 ? `${min}m ${secRemain}s` : `${secRemain}s`;
};

// Format date
const getFormattedDate = (date: Date) => format(date, 'dd-MMM-yyyy hh:mm a');

export { formatDuration, getFormattedDate };
