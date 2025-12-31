import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const waitForProcessFieldList: IDynamicFieldSchema[] = [
  {
    name: "processName",
    type: "text",
    label: "Process name",
    description: "The name of the process to check.",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "waitForProcessTo",
    type: "select",
    label: "Wait for process to",
    description:
      "Specify whether to wait until a certain process starts or stops.",
    selectOptions: [
      { label: "Start", value: "start" },
      { label: "Stop", value: "stop" },
    ],
    defaultValue: "start",
  },
  {
    name: "failWithTimeoutError",
    type: "switch",
    label: "Fail with timeout error",
    description:
      "Specify whether you want action to wait indefinitely or fail after a set time period.",
    defaultValue: false,
  },
  {
    name: "duration",
    type: "text",
    label: "Duration",
    description: "Duration in seconds.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "failWithTimeoutError", value: true }],
          },
        ],
      },
    },
  },
];

const waitForProcessFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["processName"],
      ["waitForProcessTo"],
      ["failWithTimeoutError"],
      ["duration"],
    ],
  },
];

const waitForProcess: ActivityConfig = {
  fieldList: waitForProcessFieldList,
  fieldCategories: waitForProcessFieldCategories,
  fieldsToWatch: ["failWithTimeoutError"],
};

export default waitForProcess;
