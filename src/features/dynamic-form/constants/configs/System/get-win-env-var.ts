import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getWindowsEnvironmentVariableFieldList: IDynamicFieldSchema[] = [
  // {
  //   name: "environmentVariableName",
  //   type: "select",
  //   label: "Environment variable name",
  //   selectOptions: [
  //     { label: "ChocolateyLastPathUpdate", value: "ChocolateyLastPathUpdate" },
  //     { label: "OneDrive", value: "OneDrive" },
  //     { label: "Path", value: "Path" },
  //     { label: "TEMP", value: "TEMP" },
  //   ],
  //   description:
  //     "The name of the environment variable whose value will be retrieved",
  //   defaultValue: "Path",
  // },
  {
    name: "environmentVariableName",
    type: "text",
    label: "Environment variable name",
    description:
      "The name of the environment variable whose value will be retrieved",
    defaultValue: "",
  },
  // Advance
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
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "searchForVariableOnlyInScope", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  // Output
  {
    name: "o_environmentVariableValueOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The environment variable's value",
    defaultValue: "EnvironmentVariableValue",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_environmentVariableValueSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_environmentVariableValueSwitch",
    type: "output-switch-field",
    label: "EnvironmentVariableValue",
    defaultValue: true,
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
      formFieldKeys: [["o_environmentVariableValueOutput", "o_environmentVariableValueSwitch"]],
    },
  ];

const getWindowsEnvironmentVariable: ActivityConfig = {
  fieldList: getWindowsEnvironmentVariableFieldList,
  fieldCategories: getWindowsEnvironmentVariableFieldCategories,
  fieldsToWatch: ["searchForVariableOnlyInScope", "o_environmentVariableValueOutput", "o_environmentVariableValueSwitch"],
};

export default getWindowsEnvironmentVariable;
