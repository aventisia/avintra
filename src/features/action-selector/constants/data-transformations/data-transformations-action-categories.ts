import { ActionCategoryType } from "../../types/action-category-type";
import { dateTimeActions } from "./date-time-actions";
import { textActions } from "./text-actions";
export const dataTransformationsActions: ActionCategoryType[] = [
  {
    name: "text",
    label: "Text",
    description: "Control and manipulate text",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: textActions,
  },
  {
    name: "dateTime",
    label: "Date time",
    description: "Get the date and time and perform time related operations",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: dateTimeActions,
  },
];
