import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const launchWordFieldList: IDynamicFieldSchema[] = [
  {
    name: "launchWord",
    type: "select",
    label: "Launch Word",
    description:
      "Specify whether to open a New Word document, or an existing one",
    selectOptions: [
      { label: "With a blank document", value: "with a blank document" },
      {
        label: "And open the following document",
        value: "and open the following document",
      },
    ],
    defaultValue: "with a blank document",
  },
  {
    name: "documentPath",
    type: "text",
    label: "Document path",
    description: "The full path of the existing Word document to open",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "launchWord", value: "and open the following document" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "makeInstanceVisible",
    type: "switch",
    label: "Make instance visible",
    description: "Specify whether to make the Word window visible or hide it",
    defaultValue: true,
  },
  {
    name: "openAsReadonly",
    type: "switch",
    label: "Open as Readonly",
    description:
      "Specify whether to open stored document in read-only mode or not",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "launchWord", value: "and open the following document" }],
          },
        ],
        initialState: false,
      },
    },
  },
  // Advance
  {
    name: "readProtectionPassword",
    type: "password",
    label: "Read protection password",
    description:
      "The read protection password on the Word document, if it's password protected",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "launchWord", value: "and open the following document" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "writeProtectionPassword",
    type: "password",
    label: "Write protection password",
    description:
      "The write protection password on the Word document, if it's password protected",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "launchWord", value: "and open the following document" }],
          },
        ],
        initialState: false,
      },
    },
  },
  
  // Output
  {
    name: "o_wordInstanceOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The specific Word instance for use with later Word actions. This allows the user to specify which of possibly several Word documents to access",
    defaultValue: "WordInstance",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_wordInstanceSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_wordInstanceSwitch",
    type: "output-switch-field",
    label: "WordInstance",
    defaultValue: true,
  },
];

const launchWordFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["launchWord"],
      ["documentPath"],
      ["makeInstanceVisible"],
      ["openAsReadonly"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [["readProtectionPassword"], ["writeProtectionPassword"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_wordInstanceOutput", "o_wordInstanceSwitch"]],
  },
];

const launchWord: ActivityConfig = {
  fieldList: launchWordFieldList,
  fieldCategories: launchWordFieldCategories,
  fieldsToWatch: ["launchWord", "o_wordInstanceOutput", "o_wordInstanceSwitch"] ,
};

export default launchWord;
