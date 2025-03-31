import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const runApplicationFieldList: IDynamicFieldSchema[] = [
  {
    name: "applicationPath",
    type: "text",
    label: "Application path",
    description: "The executable file as a complete file path",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "commandLineArguments",
    type: "text",
    label: "Command line arguments",
    description:
      "Add extra arguments that would go after the executable file name. For example, enter notepad.exe in the application path and a specific text file in the command line arguments",
    defaultValue: "",
  },
  {
    name: "workingFolder",
    type: "text",
    label: "Working folder",
    description: "The full path of the folder to work out of, if applicable",
    defaultValue: "",
  },
  {
    name: "windowStyle",
    type: "select",
    label: "Window Style",
    selectOptions: [
      { label: "Normal", value: "Normal" },
      { label: "Hidden", value: "Hidden" },
      { label: "Minimized", value: "Minimized" },
      { label: "Maximized", value: "Maximized" },
    ],
    description:
      "Choose the appearance and size of the application window when it opens",
    defaultValue: "Normal",
  },
  {
    name: "afterApplicationLaunch",
    type: "select",
    label: "After application launch",
    selectOptions: [
      { label: "Continue immediately", value: "Continue immediately" },
      {
        label: "Wait for application to load",
        value: "Wait for application to load",
      },
      {
        label: "Wait for application to complete",
        value: "Wait for application to complete",
      },
    ],
    description:
      "Specify whether the next action execute immediately, or wait until the program loads or completes",
    defaultValue: "Continue immediately",
  },
  {
    name: "timeout",
    type: "text",
    label: "Timeout",
    description:
      "The maximum wait time, and how long before forcing a continue",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "afterApplicationLaunch", value: "Wait for application to load" },
              { key: "afterApplicationLaunch", value: "Wait for application to complete" }
            ],
            logicalOperator:"OR"
          },
        ],
        initialState: false,
      },
    },
  },
  //   output 
  {
    name: "o_appProcessIdOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The process ID output",
    defaultValue: "AppProcessId",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_appProcessIdSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_appProcessIdSwitch",
    type: "output-switch-field",
    label: "AppProcessId",
    defaultValue: true,
  },
  {
    name: "o_appExitCodeOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The application exit code",
    defaultValue: "AppExitCode",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_appExitCodeSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_appExitCodeSwitch",
    type: "output-switch-field",
    label: "AppExitCode",
    defaultValue: true,
  },
];

const runApplicationFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["applicationPath"],
      ["commandLineArguments"],
      ["workingFolder"],
      ["windowStyle"],
      ["afterApplicationLaunch"],
      ["timeout"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_appProcessIdOutput", "o_appProcessIdSwitch"], ["o_appExitCodeOutput", "o_appExitCodeSwitch"]],
  },
];

const runApplication: ActivityConfig = {
  fieldList: runApplicationFieldList,
  fieldCategories: runApplicationFieldCategories,
  fieldsToWatch: ["afterApplicationLaunch", "o_appProcessIdOutput", "o_appProcessIdSwitch", "o_appExitCodeOutput", "o_appExitCodeSwitch"],
};

export default runApplication;
