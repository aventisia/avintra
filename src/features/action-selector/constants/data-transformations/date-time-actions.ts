import { NodeDataType } from "@/types/node-data-type";

export const dateTimeActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "addToDatetime",
    label: "Add to datetime",
    description:
      "Adds (or subtracts) a specific number of seconds, minutes, hours or days to a datetime value",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "subtractDates",
    label: "Subtract dates",
    description:
      "Finds the time difference between two given dates in days, hours, minutes, or seconds",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getCurrentDateAndTime",
    label: "Get current date and time",
    description: "Retrieves the current date or the current date and time",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
