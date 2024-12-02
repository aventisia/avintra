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
  },
  {
    name: "makeInstanceVisible",
    type: "switch",
    label: "Make instance visible",
    description: "Specify whether to make the Word window visible or hide it",
    defaultValue: false,
  },
  {
    name: "openAsReadonly",
    type: "switch",
    label: "Open as Readonly",
    description:
      "Specify whether to open stored document in read-only mode or not",
    defaultValue: false,
  },
  {
    name: "readProtectionPassword",
    type: "password",
    label: "Read protection password",
    description:
      "The read protection password on the Word document, if it's password protected",
    defaultValue: "",
  },
  {
    name: "writeProtectionPassword",
    type: "password",
    label: "Write protection password",
    description:
      "The write protection password on the Word document, if it's password protected",
    defaultValue: "",
  },
  {
    name: "wordInstance",
    type: "switch",
    label: "WordInstance",
    description:
      "The specific Word instance for use with later Word actions. This allows the user to specify which of possibly several Word documents to access",
    defaultValue: "",
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
    formFieldKeys: [["wordInstance"]],
  },
];

const launchWord: ActivityConfig = {
  fieldList: launchWordFieldList,
  fieldCategories: launchWordFieldCategories,
  fieldsToWatch: [],
};

export default launchWord;
