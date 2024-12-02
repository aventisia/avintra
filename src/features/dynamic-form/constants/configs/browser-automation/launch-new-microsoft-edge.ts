import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const launchNewIMicrosoftEdgeFieldList: IDynamicFieldSchema[] = [
  {
    name: "launchMode",
    type: "select",
    label: "Launch mode",
    description:
      "Specify whether to launch the automation browser or a new instance of Internet Explorer or attach to an existing one",
    selectOptions: [
      {
        label: "Launch automation browser",
        value: "launch automation browser",
      },
      {
        label: "Launch new Internet Explorer",
        value: "launch new Internet Explorer",
      },
      {
        label: "Attach to running Internet Explorer",
        value: "Attach to running Internet Explorer",
      },
    ],
    defaultValue: "launch automation browser",
  },
  {
    name: "attachToInternetExplorerTab",
    type: "select",
    label: "Attach to Internet Explorer tab",
    description:
      "Specify whether to attach to an Internet Explorer tab by its title, URL, or attach to the active tab of Internet Explorer running as the foreground window",
    selectOptions: [
      { label: "By title", value: "by title" },
      { label: "By URL", value: "by URL" },
      { label: "Use foreground window", value: "use foreground window" },
    ],
    defaultValue: "by title",
  },
  {
    name: "initialURL",
    type: "text",
    label: "Initial URL",
    description:
      "	Enter the URL of the web site to visit when the web browser is launched",
    defaultValue: "",
  },
  {
    name: "tabTitle",
    type: "text",
    label: "Tab title",
    description:
      "Enter the title (or part of it) of the Internet Explorer tab to attach to",
    defaultValue: "",
  },
  {
    name: "tabuRL",
    type: "text",
    label: "Tab URL",
    description:
      "	Enter the URL (or part of it) of the Internet Explorer tab to attach to",
    defaultValue: "",
  },
  {
    name: "windowState",
    type: "select",
    label: "Window state",
    description:
      "Specify whether to launch the browser window in normal, minimized, or maximized state",
    selectOptions: [
      { label: "Normal", value: "normal" },
      { label: "Maximized", value: "maximized" },
      { label: "Minimized", value: "minimized" },
    ],
    defaultValue: "normal",
  },
  {
    name: "targetDesktop",
    type: "select",
    label: "Target desktop",
    description:
      "Set the connection string of the target desktop that the browser launches",
    selectOptions: [
      { label: "Local computer", value: "local computer" },
      {
        label:
          "Any virtual desktop that is either currently connected or has at least one UI element captured",
        value:
          "any virtual desktop that is either currently connected or has at least one UI element captured",
      },
    ],
    defaultValue: "local computer",
  },
  {
    name: "clearCache",
    type: "switch",
    label: "Clear cache",
    description:
      "Specify whether to clear the entire cache of the web browser right after launching it",
    defaultValue: false,
  },
  {
    name: "clearCookies",
    type: "switch",
    label: "Clear cookies",
    description:
      "Specify whether to clear all stored cookies in the web browser right after launching it",
    defaultValue: false,
  },
  {
    name: "waitForPageToLoad",
    type: "switch",
    label: "Wait for page to load",
    description:
      "Specify whether to wait for the new web page to load completely before proceeding",
    defaultValue: true,
  },
  {
    name: "timeoutForWebpageToLoad",
    type: "number",
    label: "Timeout for webpage to load",
    description:
      "Set the time in seconds for page to load before the action throws an error",
    defaultValue: 60,
  },
  {
    name: "ifAPop-UpDialogAppears",
    type: "select",
    label: "If a pop-up dialog appears",
    description:
      "Specify what to do if a pop-up dialog appears while loading the initial web page",
    selectOptions: [
      { label: "Close it", value: "close it" },
      { label: "Press a button", value: "press a button" },
      { label: "Do nothing", value: "do nothing" },
    ],
    defaultValue: "",
  },
  {
    name: "dialogButtonToPress",
    type: "text",
    label: "Dialog button to press",
    description: "Enter the dialog button to press if a pop-up dialog appears",
    defaultValue: "ok",
  },

  {
    name: "timeOut",
    type: "number",
    label: "Timeout",
    description:
      "Set the time in seconds that you want to wait for the browser to be opened before the action fails",
    defaultValue: 60,
  },
  {
    name: "userDataFolder",
    type: "select",
    label: "User data folder",
    description:
      "Specify the user data folder the browser uses when the flow runs in Picture-in-Picture. If Browser default is selected, the browser can't be opened on both the desktop and in Picture-in-Picture at the same time.",
    selectOptions: [
      {
        label: "Picture-in-Picture default",
        value: "picture-in-Picture default",
      },
      { label: "Browser default", value: "browser default" },
      { label: "Custom", value: "custom" },
    ],
    defaultValue: "picture-in-Picture default",
  },
  {
    name: "userDataFolderPath",
    type: "text",
    label: "User data folder path",
    description:
      "Specify the path of the user data folder the browser will use when the flow runs in Picture-in-Picture.",
    defaultValue: "",
  },
  // output
  {
    name: "browser",
    type: "switch",
    label: "Browser",
    description: "The Chrome instance to use with browser automation actions",
    defaultValue: true,
  },
];

const launchNewIMicrosoftEdgeFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["launchMode"],
      ["attachToInternetExplorerTab"],
      ["initialURL"],
      ["tabTitle"],
      ["tabuRL"],
      ["windowState"],
      ["targetDesktop"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["clearCache"],
      ["clearCookies"],
      ["waitForPageToLoad"],
      ["timeoutForWebpageToLoad"],
      ["ifAPop-UpDialogAppears"],
      ["dialogButtonToPress"],
      ["timeOut"],
      ["userDataFolder"],
      ["userDataFolderPath"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["browser"]],
  },
];

const launchNewIMicrosoftEdge: ActivityConfig = {
  fieldList: launchNewIMicrosoftEdgeFieldList,
  fieldCategories: launchNewIMicrosoftEdgeFieldCategories,
  fieldsToWatch: [],
};

export default launchNewIMicrosoftEdge;
