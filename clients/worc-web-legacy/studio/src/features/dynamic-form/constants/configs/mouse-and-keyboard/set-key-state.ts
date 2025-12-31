import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const setKeyStateFieldList: IDynamicFieldSchema[] = [
  {
    name: "key",
    type: "select",
    label: "Key",
    description: "Specify the key to set",
    selectOptions: [
      { label: "Caps Lock", value: "Caps Lock" },
      { label: "Num Lock", value: "Num Lock" },
      { label: "Scroll Lock", value: "Scroll Lock" },
    ],
    defaultValue: "Caps Lock",
  },
  {
    name: "state",
    type: "select",
    label: "State",
    description: "Whether to set the key state to on or off",
    selectOptions: [
      { label: "Off", value: "Off" },
      { label: "On", value: "On" },
    ],
    defaultValue: "On",
  },
];

const setKeyStateFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["key"], ["state"]],
  },
];
const setKeyState: ActivityConfig = {
  fieldList: setKeyStateFieldList,
  fieldCategories: setKeyStateFieldCategories,
  fieldsToWatch: [],
};

export default setKeyState;
