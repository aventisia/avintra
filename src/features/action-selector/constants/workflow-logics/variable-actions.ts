import { NodeDataType } from "@/types/node-data-type";

export const variableActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "TruncateNumberActivity",
    label: "Truncate number",
    description:
      "Performs various operations on a number, such as getting the integer part, decimal part, or rounding.",
    docsLink: "/agent-builder/workflow-logics/variable/truncate-number",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "generateRandomNumber",
    label: "Generate random number",
    description:
      "Generate a random number or a list of random numbers that fall between a minimum and maximum value",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "clearList",
    label: "Clear list",
    description: "Remove all items from a list",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "removeItemFromList",
    label: "Remove item from list",
    description: "Remove one or multiple items from a list",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "sortList",
    label: "Sort list",
    description: "Sort the items of a list. Use items of the same type",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "shuffleList",
    label: "Shuffle list",
    description: "Create a random permutation of a list",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "mergeLists",
    label: "Merge lists",
    description: "Merge two lists into one",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "reverseList",
    label: "Reverse list",
    description: "Reverse the order of the items of a list",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "removeDuplicateItemsFromList",
    label: "Remove duplicate items from list",
    description:
      "Remove the multiple occurrences of items in a list, so that in the resulting list each item is unique",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "findCommonListItems",
    label: "Find common list items",
    description:
      "Compare two lists and create a new list with the items that are common to both",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "subtractLists",
    label: "Subtract lists",
    description:
      "Compare two lists and create a new list with the items that are in the first list but not in the second",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "retrieveDataTableColumnIntoList",
    label: "Retrieve data table column into list",
    description: "Convert the contents of a data table column into a list",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "convertJsonToCustomObject",
    label: "Convert JSON to custom object",
    description: "Convert a JSON string to a custom object",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "convertCustomObjectToJson",
    label: "Convert custom object to JSON",
    description: "Convert a custom object to a JSON string",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "addItemToList",
    label: "Add item to list",
    description: "Append a new item to a list",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "createNewList",
    label: "Create new list",
    description: "Create a new empty list",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "increaseVariable",
    label: "Increase variable",
    description: "Increase the value of a variable by a specific amount",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "decreaseVariable",
    label: "Decrease variable",
    description: "Decrease the value of a variable by a specific amount",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "runPowerFxExpression",
    label: "Run Power Fx expression",
    description: "Runs the provided Power Fx expression",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setVariable",
    label: "Set variable",
    description:
      "Set the value of a new or existing variable, create a new variable or overwrite a previously created variable",
    img: `${import.meta.env.BASE_URL}function.png`,
    formType: "custom",
  },
];
