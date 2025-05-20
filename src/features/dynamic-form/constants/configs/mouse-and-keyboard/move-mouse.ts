import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

// in this activity json in ui it has current cursor position

const moveMouseFieldList: IDynamicFieldSchema[] = [
  {
    name: "positionX",
    type: "number",
    label: "Position X",
    description:
      "The horizontal (X) value of the position to send the mouse to",
    defaultValue: null,
  },

  {
    name: "positionY",
    type: "number",
    label: "Position Y",
    description: "The vertical (Y) value of the position to send the mouse to",
    defaultValue: null,
  },
  {
    name: "relativeTo",
    type: "select",
    label: "Relative To",
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
    name: "moveMouse",
    type: "select",
    label: "Move Mouse From Previous Position",
    description: "Specify how to move the mouse",
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

const moveMouseFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["positionX"],
      ["positionY"],
      ["relativeTo"],
      ["moveMouse"],
    ],
  },
];
const moveMouse: ActivityConfig = {
  fieldList: moveMouseFieldList,
  fieldCategories: moveMouseFieldCategories,
  fieldsToWatch: [],
};

export default moveMouse;
