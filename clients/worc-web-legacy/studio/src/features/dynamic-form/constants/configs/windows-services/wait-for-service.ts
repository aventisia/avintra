import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const WaitForServiceFieldList: IDynamicFieldSchema[] = [
  {
    name: "waitForServiceTo",
    type: "select",
    label: "Wait for service to",
    description:
      "Specifies whether the flow pauses until a certain service starts, stops or pauses",
    selectOptions: [
      { label: "Stop", value: "stop" },
      { label: "Start", value: "start" },
      { label: "Pause", value: "pause" },
    ],
    defaultValue: "start",
  },
  {
    name: "serviceName",
    type: "text",
    label: "Service name",
    description: "The name of the service to check",
    defaultValue: "",
  },
  {
    name: "failWithTimeoutError",
    type: "switch",
    label: "Fail with timeout error",
    description:
      "Specify whether you want the action to wait indefinitely or fail after a set time period",
    defaultValue: false,
  },
  {
    name: "duration",
    type: "text",
    label: "Duration",
    description: "Tme duration in seconds",
    defaultValue: 5,
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

const WaitForServiceFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["waitForServiceTo"],
      ["serviceName"],
      ["failWithTimeoutError"],
      ["duration"],
    ],
  },
];

const waitForServiceFieldsToWatch: string[] = ["failWithTimeoutError"];

const waitForService: ActivityConfig = {
  fieldList: WaitForServiceFieldList,
  fieldCategories: WaitForServiceFieldCategories,
  fieldsToWatch: waitForServiceFieldsToWatch,
};

export default waitForService;
