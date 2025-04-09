import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";
const getTextFromTerminalSessionFieldList: IDynamicFieldSchema[] = [
  {
    name: "terminalSession",
    type: "text",
    label: "Terminal session",
    description: "The terminal session to work with",
    defaultValue: "",
  },
  {
    name: "GetTextFrom",
    type: "select",
    label: "Get text from",
    description: "The location to get the text from",
    selectOptions: [
      { label: "Field", value: "field" },
      { label: "Entire screen", value: "entire screen" },
      { label: "Cursor position", value: "cursor position" },
      { label: "Specific position", value: "specific position" },
    ],
    defaultValue: "field",
  },
  {
    name: "getFieldBy",
    type: "select",
    label: "Get field by",
    description: "Specifies how to look for the field",
    selectOptions: [
      { label: "Label", value: "label" },
      { label: "Index", value: "index" },
      { label: "Position", value: "position" },
    ],
    defaultValue: "label",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "GetTextFrom", value: "field" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "label",
    type: "text",
    label: "Label",
    description: "The label of the field to look for",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "GetTextFrom", value: "field" },
              {key: "getFieldBy",  value: "label"}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "index",
    type: "number",
    label: "Index",
    description: "The index of the field to look for",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "GetTextFrom", value: "field" },
              {key: "getFieldBy",  value: "index"}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "textLength",
    type: "number",
    label: "Text length",
    description: "The length of the text to receive",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "GetTextFrom", value: "cursor position" },
              { key: "GetTextFrom", value: "specific position" },
            ],
            logicalOperator: "OR"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "row",
    type: "number",
    label: "Row",
    description: "The vertical position of the field on the screen",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "GetTextFrom", value: "field" },
              {key: "getFieldBy",  value: "position"}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "column",
    type: "number",
    label: "Column",
    description: "The horizontal position of the field on the screen",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "GetTextFrom", value: "field" },
              {key: "getFieldBy",  value: "position"}
            ],
            logicalOperator: "AND"
          },
        ],
        initialState: false,
      },
    },
  },
  // -------------------
  {
    name: "rowSP",
    type: "number",
    label: "Row",
    description: "The vertical position of the field on the screen",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "GetTextFrom", value: "specific position" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "columnSP",
    type: "number",
    label: "Column",
    description: "The horizontal position of the field on the screen",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "GetTextFrom", value: "specific position" },
            ],
          },
        ],
        initialState: false,
      },
    },
  },
  //output
  {
    name: "terminalText",
    type: "text",
    label: "TerminalText",
    description: "The text retrieved from the terminal session",
    defaultValue: "",
  },
];

const getTextFromTerminalSessionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["terminalSession"],
      ["GetTextFrom"],
      ["getFieldBy"],
      ["label"],
      ["index"],
      ["textLength"],
      ["row"],
      ["column"],
      ["rowSP"],
      ["columnSP"]
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["terminalText"]],
  },
];
const getTextFromTerminalSession: ActivityConfig = {
  fieldList: getTextFromTerminalSessionFieldList,
  fieldCategories: getTextFromTerminalSessionFieldCategories,
  fieldsToWatch: ["GetTextFrom", "getFieldBy"],
};

export default getTextFromTerminalSession;
