import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const showDesktopFieldList: IDynamicFieldSchema[] = [
  {
    name: "operation",
    type: "select",
    label: "Operation",
    selectOptions: [
      {
        label: "Minimize all windows (show desktop)",
        value: "Minimize all windows (show desktop)",
      },
      {
        label: "Restore all windows (undo show desktop)",
        value: "Restore all windows (undo show desktop)",
      },
    ],
    description:
      "Specify whether to minimize all windows to reveal the desktop or restore all windows to their original respective states",
    defaultValue: "Minimize all windows (show desktop)",
  },
];

const showDesktopFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["operation"]],
  },
];

const showDesktop: ActivityConfig = {
  fieldList: showDesktopFieldList,
  fieldCategories: showDesktopFieldCategories,
  fieldsToWatch: [],
};

export default showDesktop;
