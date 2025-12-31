import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const setTextOnTerminalSessionFieldList: IDynamicFieldSchema[] = [
  {
    name: "terminalSession",
    type: "text",
    label: "Terminal session",
    description: "The terminal session to work with",
    defaultValue: "",
  },
  {
    name: "inputTextAs",
    type: "select",
    label: "Input text as",
    description: "The text to fill in the text field",
    selectOptions: [
      { label: "Input as text, variable or expression", value: "inputAsText" },
      { label: "Direct encrypted text input", value: "encryptedText" },
    ],
    defaultValue: "inputAsText",
  },
  {
    name: "text",
    type: "textarea",
    label: "Text",
    description: "The text to fill in the text field",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "inputTextAs", value: "inputAsText" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "textEncrypt",
    type: "password",
    label: "Text",
    description: "The text to fill in the text field",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "inputTextAs", value: "encryptedText" }],
          },
        ],
        initialState: false,
      },
    },
  },

  // {
  //   name: "text",
  //   type: "text",
  //   label: "Text",
  //   description: "The text to set on the specified location",
  //   defaultValue: "",
  // },
  {
    name: "setText",
    type: "select",
    label: "Set text",
    description: "The location to set the text to",
    selectOptions: [
      { label: "Cursor Position", value: "cursor position" },
      { label: "Field", value: "field" },
    ],
    defaultValue: "field",
  },
  {
    name: "getFieldBy",
    type: "select",
    label: "Get field by",
    description: "Specifies the way by which to look for the field",
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
            fields: [{ key: "setText", value: "field" }],
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
              { key: "setText", value: "field" },
              { key: "getFieldBy", value: "label" },
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
    description: "The index of the field on the screen",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [
              { key: "setText", value: "field" },
              { key: "getFieldBy", value: "index" },
            ],
            logicalOperator: "AND"
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
              { key: "setText", value: "field" },
              { key: "getFieldBy", value: "position" },
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
              { key: "setText", value: "field" },
              { key: "getFieldBy", value: "position" },
            ],
            logicalOperator: "AND"

          },
        ],
        initialState: false,
      },
    },
  },
  // Advance
  {
    name: "treat@CharacterAsLiteral",
    type: "switch",
    label: "Treat @ character as literal",
    description:
      "Check this box to send the '@' character literally. Leave this option disabled to sent it as a special character",
    defaultValue: false,
  },
];

const setTextOnTerminalSessionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["terminalSession"],
      ["inputTextAs"],
      ["text"],
      ["textEncrypt"],
      ["setText"],
      ["getFieldBy"],
      ["label"],
      ["index"],
      ["row"],
      ["column"],
      ["CharacterAsLiteral"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [["treat@CharacterAsLiteral"]],
  },
];

const setTextOnTerminalSessionFieldsToWatch: string[] = ["inputTextAs", "setText", "getFieldBy"];
const setTextOnTerminalSession: ActivityConfig = {
  fieldList: setTextOnTerminalSessionFieldList,
  fieldCategories: setTextOnTerminalSessionFieldCategories,
  fieldsToWatch: setTextOnTerminalSessionFieldsToWatch,
};

export default setTextOnTerminalSession;
