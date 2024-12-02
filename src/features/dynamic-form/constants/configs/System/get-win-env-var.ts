import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getWindowsEnvironmentVariableFieldList: IDynamicFieldSchema[] = [
  {
    name: "environmentVariableName",
    type: "select",
    label: "Environment variable name",
    selectOptions: [
      { label: "ChocolateyLastPathUpdate", value: "ChocolateyLastPathUpdate" },
      { label: "OneDrive", value: "OneDrive" },
      { label: "Path", value: "Path" },
      { label: "TEMP", value: "TEMP" },
    ],
    description:
      "The name of the environment variable whose value will be retrieved",
    defaultValue: "Path",
  },
  {
    name: "searchForVariableOnlyInScope",
    type: "switch",
    label: "Search for variable only in scope",
    description:
      "Specify whether to search for the variable only in a specific scope",
    defaultValue: false,
  },
  {
    name: "type",
    type: "select",
    label: "Scope",
    selectOptions: [
      { label: "User", value: "User" },
      { label: "System", value: "System" },
    ],
    description:
      "The scope from which the environment variable should be retrieved",
    defaultValue: "User",
  },
  {
    name: "environmentVariableValue",
    type: "switch",
    label: "EnvironmentVariableValue",
    description: "The environment variable's value",
    defaultValue: "",
  },
];

const getWindowsEnvironmentVariableFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["environmentVariableName"],
      ],
    },
    {
      title: "Advanced",
      formFieldKeys: [["searchForVariableOnlyInScope"], ["type"]],
    },
    {
      title: "Output",
      formFieldKeys: [["environmentVariableValue"]],
    },
  ];

const getWindowsEnvironmentVariable: ActivityConfig = {
  fieldList: getWindowsEnvironmentVariableFieldList,
  fieldCategories: getWindowsEnvironmentVariableFieldCategories,
  fieldsToWatch: [],
};

export default getWindowsEnvironmentVariable;
