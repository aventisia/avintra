import { format } from "date-fns";

export const dateFormatter = (
  date: Date | string,
  formatType: string = "dd MMM yyyy",
): string => {
  return format(date, formatType);
};
