import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../../types/dynamic-form-types";

const findOrReplaceInDataTableFieldList: IDynamicFieldSchema[] = [
  {
    name: "dataTable",
    type: "text",
    label: "Data table",
    description:
      "The data table variable to work with. This variable must have been previously specified by an action that produces a data table variable",
    defaultValue: "",
  },
  {
    name: "searchMode", // to watch
    type: "select",
    label: "Search mode",
    description: "The mode to search with (find or find and replace)",
    selectOptions: [
      { label: "Find", value: "find" },
      { label: "Find and replace", value: "findAndReplace" },
    ],
    defaultValue: "find",
  },
  {
    name: "allMatches",
    type: "switch",
    label: "All matches",
    description:
      "Specify whether to find or replace text in all the matching cells found or the first matching cell only.",
    defaultValue: true,
  },
  {
    name: "textToFind",
    type: "text",
    label: "Text to find",
    description: "The text to find in data table",
    defaultValue: "",
  },
  {
    name: "findUsingARegularExpression", // to watch
    type: "switch",
    label: "Find using a regular expression",
    description:
      "Specify whether to use a regular expression to match the cell contents with the text to find",
    defaultValue: false,
  },
  {
    name: "matchCase",
    type: "switch",
    label: "Match case",
    description: "Specify whether to search for case-sensitive data",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "findUsingARegularExpression", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "matchEntireCellContents",
    type: "switch",
    label: "Match entire cell contents",
    description:
      "Specify whether to search for cells that contain just the specified text",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "findUsingARegularExpression", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "textToReplaceWith",
    type: "text",
    label: "Text to replace with",
    description: "The text used to replace the matching cells",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "searchMode", value: "findAndReplace" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "searchBy", // to watch
    type: "select",
    label: "Search by",
    description:
      "The order in which to search for the text (everywhere, or on column)",
    selectOptions: [
      { label: "Everywhere", value: "everywhere" },
      { label: "On column", value: "onColumn" },
    ],
    defaultValue: "everywhere",
  },
  {
    name: "columnIndexOrName",
    type: "text",
    label: "Column index or name",
    description: "The column header name or index value",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "searchBy", value: "onColumn" }],
          },
        ],
        initialState: false,
      },
    },
  },
  //output
  {
    name: "dataTableMatches",
    type: "switch",
    label: "DataTableMatches",
    description:
      "The data table containing the row and column indexes for matches.",
    defaultValue: true,
  },
];

const findOrReplaceInDataTableFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["dataTable"],
      ["searchMode"],
      ["allMatches"],
      ["textToFind"],
      ["findUsingARegularExpression"],
      ["matchCase"],
      ["matchEntireCellContents"],
      ["textToReplaceWith"],
      ["searchBy"],
      ["columnIndexOrName"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["dataTableMatches"]],
  },
];
const findOrReplaceInDataTableFieldsToWatch: string[] = [
  "searchMode",
  "findUsingARegularExpression",
  "searchBy",
];

const findOrReplaceInDataTable: ActivityConfig = {
  fieldList: findOrReplaceInDataTableFieldList,
  fieldCategories: findOrReplaceInDataTableFieldCategories,
  fieldsToWatch: findOrReplaceInDataTableFieldsToWatch,
};

export default findOrReplaceInDataTable;
