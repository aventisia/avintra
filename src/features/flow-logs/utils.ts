import { format } from "date-fns";

//Format Date
export const getFormattedDate = (date: Date) => format(date, "MMM d y, h:mm a");
