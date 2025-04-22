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
  // Output
  {
    name: "o_mousePosXOutput", //to watch
    type: "output-text-field",
    label: "",
      description: "The horizontal (X) value of the mouse position",
    defaultValue: "MousePosX",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_mousePosXSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_mousePosXSwitch",
    type: "output-switch-field",
    label: "Mouse X Position",
    defaultValue: true,
  },

  {
    name: "o_mousePosYOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The vertical (Y) value of the mouse position",
    defaultValue: "MousePosY",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_mousePosYSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_mousePosYSwitch",
    type: "output-switch-field",
    label: "Mouse Y Position",
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
    formFieldKeys: [["o_mousePosXOutput", "o_mousePosXSwitch"], ["o_mousePosYOutput", "o_mousePosYSwitch"]],
  },
];
const getMousePosition: ActivityConfig = {
  fieldList: getMousePositionFieldList,
  fieldCategories: getMousePositionFieldCategories,
  fieldsToWatch: ["o_mousePosXOutput", "o_mousePosXSwitch", "o_mousePosYOutput", "o_mousePosYSwitch"],
};

export default getMousePosition;
