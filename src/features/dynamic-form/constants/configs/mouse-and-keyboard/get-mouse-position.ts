import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getMousePositionFieldList: IDynamicFieldSchema[] = [
  {
    name: "relativeTo",
    type: "select",
    label: "Relative To",
    description:
      "Specify whether to retrieve the mouse position in screen coordinates or relative to the top left corner of the active window",
    selectOptions: [
      { label: "Screen", value: "Screen" },
      { label: "Foreground window", value: "Foreground window" },
    ],
    defaultValue: "Screen",
  },
  {
    name: "mousePosX",
    type: "switch",
    label: "Mouse X Position",
    description: "The horizontal (X) value of the mouse position",
    defaultValue: true,
  },
  {
    name: "mousePosY",
    type: "switch",
    label: "Mouse Y Position",
    description: "The vertical (Y) value of the mouse position",
    defaultValue: true,
  },
];

const getMousePositionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["relativeTo"]],
  },
  {
    title: "Output",
    formFieldKeys: [["mousePosX"], ["mousePosY"]],
  },
];
const getMousePosition: ActivityConfig = {
  fieldList: getMousePositionFieldList,
  fieldCategories: getMousePositionFieldCategories,
  fieldsToWatch: [],
};

export default getMousePosition;
