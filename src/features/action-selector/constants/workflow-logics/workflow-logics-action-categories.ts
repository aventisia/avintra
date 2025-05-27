import { ActionCategoryType } from "../../types/action-category-type";
import { conditionsLoopsActions } from "./conditons-loops-actions";
import { flowControlActions } from "./flow-control-actions";

export const workFlowLogicsActions: ActionCategoryType[] = [
  {
    name: "conditionsLoops",
    label: "Conditionals and Loops",
    description:
      "Control the flow of execution based on predefined rules, enabling decision-making, repetition of actions, and iteration through collections.",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: conditionsLoopsActions,
  },
  {
    name: "flowControl",
    label: "Flow control",
    description: "Set rules and manage the course of the flow",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: flowControlActions,
  },
];
