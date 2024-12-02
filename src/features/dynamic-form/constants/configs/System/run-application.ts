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
  },
  //   output 
  {
    name: "appProcessId",
    type: "switch",
    label: "AppProcessId",
    description: "The process ID output",
    defaultValue: false,
  },
  {
    name: "windowHandle",
    type: "switch",
    label: "WindowHandle",
    description:
      "Tne window handle. When opening a new window, this will catch the value if the window handle, abd store it in this variable. A window handle is useful to specifically identify a window in a later action",
    defaultValue: false,
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
    formFieldKeys: [["appProcessId"], ["windowHandle"]],
  },
];

const runApplication: ActivityConfig = {
  fieldList: runApplicationFieldList,
  fieldCategories: runApplicationFieldCategories,
  fieldsToWatch: [],
};

export default runApplication;
