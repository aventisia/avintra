import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const waitForTextOnTerminalSessionFieldList: IDynamicFieldSchema[] = [
  {
    name: "terminalSession",
    type: "select",
    label: "Terminal session",
    description: "	The previously opened terminal session",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "TextToWaitFor",
    type: "text",
    label: "Text to wait for",
    description: "",
    defaultValue: "",
  },
  {
    name: "regularExpression",
    type: "switch",
    label: "Regular expression",
    description:
      "Specifies whether to wait for a regular expression instead of plain text",
    defaultValue: false,
  },
  {
    name: "waitForTextLocation",
    type: "select",
    label: "Wait for text location",
    description: "The location to wait for the text to appear on",
    selectOptions: [
      { label: "Screen", value: "screen" },
      { label: "Field", value: "field" },
    ],
    defaultValue: "screen",
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
            fields: [
              {key: "waitForTextLocation", value: "field"}
            
            ],
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
              { key: "waitForTextLocation", value: "field" },
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
              { key: "waitForTextLocation", value: "field" },
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
              { key: "waitForTextLocation", value: "field" },
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
              { key: "waitForTextLocation", value: "field" },
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
    name: "timeOut",
    type: "number",
    label: "Timeout",
    description: "The maximum amount of time to wait",
    defaultValue: "",
  },
];

const waitForTextOnTerminalSessionFieldCategories: IDynamicFormKeysCategory[] =
  [
    {
      title: "Basic",
      formFieldKeys: [
        ["terminalSession"],
        ["TextToWaitFor"],
        ["regularExpression"],
        ["waitForTextLocation"],
        ["getFieldBy"],
        ["label"],
        ["index"],
        ["row"],
        ["column"],
      ],
    },
    {
      title: "Advanced",
      formFieldKeys: [["timeOut"]],
    },
  ];
const waitForTextOnTerminalSession: ActivityConfig = {
  fieldList: waitForTextOnTerminalSessionFieldList,
  fieldCategories: waitForTextOnTerminalSessionFieldCategories,
  fieldsToWatch: ["waitForTextLocation", "getFieldBy"],
};

export default waitForTextOnTerminalSession;
