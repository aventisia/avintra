import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const launchNewChromeFieldList: IDynamicFieldSchema[] = [
  {
    name: "launchMode",
    type: "select",
    label: "Launch mode",
    description:
      "Specify whether to launch the automation browser or a new instance of Internet Explorer or attach to an existing one",
    selectOptions: [
      {
        label: "Launch new Instance",
        value: "Launch new Instance",
      },
      {
        label: "Attach to running Instance",
        value: "Attach to running Instance",
      },
    ],
    defaultValue: "Launch new Instance",
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
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "launchMode", value: "Attach to running Instance" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "initialURL",
    type: "text",
    label: "Initial URL",
    description:
      "	Enter the URL of the web site to visit when the web browser is launched",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "launchMode", value: "Launch new Instance" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "tabTitle",
    type: "text",
    label: "Tab title",
    description:
      "Enter the title (or part of it) of the Internet Explorer tab to attach to",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "launchMode", value: "Attach to running Instance" },
              {key: "attachToInternetExplorerTab", value: "by title"}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "tabuRL",
    type: "text",
    label: "Tab URL",
    description:
      "	Enter the URL (or part of it) of the Internet Explorer tab to attach to",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "launchMode", value: "Attach to running Instance" },
              {key: "attachToInternetExplorerTab", value: "by URL"}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
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
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "launchMode", value: "Launch new Instance" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "targetDesktop",
    type: "select",
    label: "Target desktop",
    description:
      "Set the connection string of the target desktop that the browser launches",
    selectOptions: [
      { label: "Local computer", value: "local computer" },
      // {
      //   label:
      //     "Any virtual desktop that is either currently connected or has at least one UI element captured",
      //   value:
      //     "any virtual desktop that is either currently connected or has at least one UI element captured",
      // },
    ],
    defaultValue: "local computer",
  },
  // Advance
  {
    name: "clearCache",
    type: "switch",
    label: "Clear cache",
    description:
      "Specify whether to clear the entire cache of the web browser right after launching it",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "launchMode", value: "Launch new Instance" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "clearCookies",
    type: "switch",
    label: "Clear cookies",
    description:
      "Specify whether to clear all stored cookies in the web browser right after launching it",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "launchMode", value: "Launch new Instance" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "waitForPageToLoad",
    type: "switch",
    label: "Wait for page to load",
    description:
      "Specify whether to wait for the new web page to load completely before proceeding",
    defaultValue: true,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "launchMode", value: "Launch new Instance" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "timeoutForWebpageToLoad",
    type: "number",
    label: "Timeout for webpage to load",
    description:
      "Set the time in seconds for page to load before the action throws an error",
    defaultValue: 60,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "waitForPageToLoad", value: true },
              { key: "launchMode", value: "Launch new Instance" }
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: true,
      },
    },
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
    defaultValue: "close it",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "launchMode", value: "Launch new Instance" },
              {key: "waitForPageToLoad", value: true}
            ],
            logicalOperator: "AND",
          },
        ],
        initialState: true,
      },
    }
  },
  {
    name: "dialogButtonToPress",
    type: "text",
    label: "Dialog button to press",
    description: "Enter the dialog button to press if a pop-up dialog appears",
    defaultValue: "OK",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "ifAPop-UpDialogAppears", value: "press a button" },
              { key: "launchMode", value: "Launch new Instance" },
              {key: "waitForPageToLoad", value: true}
            ],
            logicalOperator :"AND"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "timeOut",
    type: "number",
    label: "Timeout",
    description:
      "Set the time in seconds that you want to wait for the browser to be opened before the action fails",
    defaultValue: 60,
  },
  // output
  {
    name: "o_browserOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The Chrome instance to use with browser automation actions",
    defaultValue: "Browser",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_browserSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_browserSwitch",
    type: "output-switch-field",
    label: "Browser",
    defaultValue: true,
  },
];

const launchNewChromeCategories: IDynamicFormKeysCategory[] = [
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
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_browserOutput", "o_browserSwitch"]],
  },
];

const launchNewChrome: ActivityConfig = {
  fieldList: launchNewChromeFieldList,
  fieldCategories: launchNewChromeCategories,
  fieldsToWatch: [
    "launchMode",
    "attachToInternetExplorerTab",
    "waitForPageToLoad",
    "ifAPop-UpDialogAppears",
    "o_browserOutput", 
    "o_browserSwitch"
  ],
};

export default launchNewChrome;
