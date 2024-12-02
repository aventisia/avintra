import { ActionCategoryType } from "../../types/action-category-type";
import { conditionalsActions } from "./conditonals-actions";
import { dataTableActions } from "./data-table-actions";
import { flowControlActions } from "./flow-control-actions";
import { httpActions } from "./http-actions";
import { loopsActions } from "./loops-actions";
import { runFlowActions } from "./run-flow-actions";
import { variableActions } from "./variable-actions";

export const workFlowLogicsActions: ActionCategoryType[] = [
  {
    name: "variable",
    label: "Variable",
    description: "Create and manage variables of different datatypes",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: variableActions,
  },
  {
    name: "dataTable",
    label: "DataTable",
    description: "Create and manipulate data in table variables",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: dataTableActions,
  },
  {
    name: "conditionals",
    label: "Conditionals",
    description:
      "Perform decision making and manage the flow according to set rules",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: conditionalsActions,
  },
  {
    name: "loops",
    label: "Loops",
    description: "Repeat blocks of actions and iterate through stacks of items",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: loopsActions,
  },
  {
    name: "flowControl",
    label: "Flow control",
    description: "Set rules and manage the course of the flow",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: flowControlActions,
  },
  {
    name: "runFlow",
    label: "Run flow",
    description: "Set your automation to trigger other flows",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: runFlowActions,
  },
  {
    name: "http",
    label: "HTTP",
    description: "Communicate with web applications and services directly",
    img: `${import.meta.env.BASE_URL}function.png`,
    actions: httpActions,
  },
];
