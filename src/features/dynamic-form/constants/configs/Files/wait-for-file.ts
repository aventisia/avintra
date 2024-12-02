import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const waitForFileFieldList: IDynamicFieldSchema[] = [
  {
    name: "waitForFileToBe",
    type: "select",
    label: "Wait for file to be",
    description: "Suspend running the flow until a file is created or deleted",
    selectOptions: [
      { label: "Created", value: "created" },
      { label: "Deleted", value: "deleted" },
    ],
    defaultValue: "created",
    regOptions: {
      required: true,
    },
  },
  {
    name: "filePath",
    type: "text",
    label: "File path",
    description: "The full path of where to look for the file",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "failWithTimeoutError",
    type: "switch",
    label: "Fail with timeout error",
    description:
      "Specify whether you want action to wait indefinitely or fail after a set time period",
    defaultValue: false,
  },
  {
    name: "duration",
    type: "text",
    label: "Duration",
    description: "Duration in seconds",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "failWithTimeoutError", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
];

const waitForFileFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "File Waiting",
    formFieldKeys: [
      ["waitForFileToBe"],
      ["filePath"],
      ["failWithTimeoutError"],
      ["duration"],
    ],
  },
];


const waitForFile: ActivityConfig = {
  fieldList: waitForFileFieldList,
  fieldCategories: waitForFileFieldCategories,
  fieldsToWatch: ["failWithTimeoutError"],
};

export default waitForFile;