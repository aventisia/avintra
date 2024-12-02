import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const sendMouseClickFieldList: IDynamicFieldSchema[] = [
  {
    name: "mouseEventToSend",
    type: "select",
    label: "Mouse event to send",
    description: "Specify what form of mouse event to send",
    selectOptions: [
      { label: "Left click", value: "Left click" },
      { label: "Right click", value: "Right click" },
      { label: "Double click", value: "Double click" },
      { label: "Middle click", value: "Middle click" },
      { label: "Left button down", value: "Left button down" },
      { label: "Left button up", value: "Left button up" },
      { label: "Right button down", value: "Right button down" },
      { label: "Right button up", value: "Right button up" },
    ],
    defaultValue: "Left click",
  },
  {
    name: "wait",
    type: "number",
    label: "Wait",
    description:
      "The time to delay before sending the mouse event in 1/1000 of a second",
    defaultValue: 0,
  },
  {
    name: "moveMouse",
    type: "switch",
    label: "Move mouse",
    description: "Move mouse",
    defaultValue: false,
  },
  {
    name: "x",
    type: "number",
    label: "X",
    description:
      "The horizontal (X) position of the mouse in pixel coordinates",

    defaultValue: "",
  },
  {
    name: "y",
    type: "number",
    label: "Y",
    description: "The vertical (Y) position of the mouse in pixel coordinates",
    defaultValue: "",
  },
  {
    name: "relativeTo",
    type: "select",
    label: "Relative to",
    description:
      "Specify whether the new mouse position will be relative to the top left corner of the screen, the foremost window, or the current mouse position",
    selectOptions: [
      { label: "Screen", value: "Screen" },
      { label: "Active window", value: "Active window" },
      { label: "Current mouse position", value: "Current mouse position" },
    ],
    defaultValue: "Screen",
  },
  {
    name: "mouseMovementStyle",
    type: "select",
    label: "Mouse movement style",
    description:
      "The style of movement in which the mouse will move from its previous position to the beginning of the recorded route (or to its final position)",
    selectOptions: [
      { label: "Instant", value: "Instant" },
      {
        label: "With animation (low speed)",
        value: "With animation (low speed)",
      },
      {
        label: "With animation (normal speed)",
        value: "With animation (normal speed)",
      },
      {
        label: "With animation (high speed)",
        value: "With animation (high speed)",
      },
    ],
    defaultValue: "Instant",
  },
];

const sendMouseClickFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["mouseEventToSend"],
      ["wait"],
      ["moveMouse"],
      ["x"],
      ["y"],
      ["relativeTo"],
      ["mouseMovementStyle"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [[""], [""]],
  },
];
const sendMouseClick: ActivityConfig = {
  fieldList: sendMouseClickFieldList,
  fieldCategories: sendMouseClickFieldCategories,
  fieldsToWatch: [],
};

export default sendMouseClick;
