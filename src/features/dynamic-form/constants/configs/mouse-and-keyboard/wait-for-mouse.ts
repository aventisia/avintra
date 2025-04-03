import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const waitForMouseFieldList: IDynamicFieldSchema[] = [
  {
    name: "waitForMousePointerTo",
    type: "select",
    label: "Wait for mouse pointer to",
    description: "Choose what action of the mouse cursor to wait for.",
    selectOptions: [
      { label: "Become", value: "Become" },
      { label: "Become not", value: "Become not" },
    ],
    defaultValue: "Become",
  },
  {
    name: "mousePointer",
    type: "select",
    label: "Mouse pointer",
    description: "Specify the mouse pointer state.",
    selectOptions: [
      { label: "Arrow", value: "Arrow" },
      { label: "App starting", value: "App starting" },
      { label: "Cross", value: "Cross" },
      { label: "Hand", value: "Hand" },
      { label: "Help", value: "Help" },
      { label: "IBeam", value: "IBeam" },
      { label: "Wait cursor", value: "Wait cursor" },
    ],
    defaultValue: "Arrow",
  },
  {
    name: "failWithTimeoutError",
    type: "switch",
    label: "Fail with timeout error",
    description: "Specifiy whether you want the action to wait indefinitely or fail after a set period of time",
    defaultValue: false,
  },
  {
    name: "duration",
    type : "number",
    label: "Duration",
    description: "Time duration in seconds",
    defaultValue: "5",
    regOptions: {
    requiredBasedOnFields: {
      conditionList: [
        {
          fields: [{ key: "failWithTimeoutError", value: true }],
        },
      ],
      initialState: false,
    },
  },}
];

const waitForMouseFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["waitForMousePointerTo"], ["mousePointer"], ["failWithTimeoutError"], ["duration"]],
  }
];
const waitForMouse: ActivityConfig = {
  fieldList: waitForMouseFieldList,
  fieldCategories: waitForMouseFieldCategories,
  fieldsToWatch: ["failWithTimeoutError"],
};

export default waitForMouse;
