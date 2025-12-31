import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const pressReleaseKeyFieldList: IDynamicFieldSchema[] = [
  {
    name: "actionToPerform",
    type: "select",
    label: "Action to perform",
    description: "Specify whether to press or release keys with this action",
    selectOptions: [
      { label: "Press", value: "Press" },
      { label: "Release", value: "Release" },
    ],
    defaultValue: "Press",
  },
  {
    name: "control",
    type: "switch",
    label: "Control",
    description: "Specify whether the Ctrl key will be pressed/released or not",
    defaultValue: false,
  },
  {
    name: "alt",
    type: "switch",
    label: "Alt",
    description: "Specify whether the Alt key will be pressed/released or not",
    defaultValue: false,
  },
  {
    name: "shift",
    type: "switch",
    label: "Shift",
    description:
      "Specify whether the Shift key will be pressed/released or not",
    defaultValue: false,
  },
  {
    name: "win",
    type: "switch",
    label: "Win",
    description:
      "Specify whether the Windows key will be pressed/released or not",
    defaultValue: false,
  },
];

const pressReleaseKeyFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["actionToPerform"],
      ["control"],
      ["alt"],
      ["shift"],
      ["win"],
    ],
  }
];
const pressReleaseKey: ActivityConfig = {
  fieldList: pressReleaseKeyFieldList,
  fieldCategories: pressReleaseKeyFieldCategories,
  fieldsToWatch: [],
};

export default pressReleaseKey;
