import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const runSubFlowFieldList: IDynamicFieldSchema[] = [
  {
    name: "runSubFlowSelect",
    type: "select",
    label: "Run subflow",
    description: "The name of the subflow to call",
    selectOptions: [], //dynamic options
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "inputAsExpression", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "runSubFlowText",
    type: "text",
    label: "Run subflow",
    description: "The name of the subflow to call",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "inputAsExpression", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "inputAsExpression",
    type: "switch",
    label: "Input as expression",
    description:
      "Define whether the input should be handled as an expression. If enabled, variables and expressions can be used to dynamically determine the subflow during runtime.",
    defaultValue: false,
  },
];

const runSubFlowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["runSubFlowSelect"],
      ["runSubFlowText"],
      ["inputAsExpression"],
    ],
  },
];
const runSubFlowFieldsToWatch: string[] = ["inputAsExpression"];

const runSubFlow: ActivityConfig = {
  fieldList: runSubFlowFieldList,
  fieldCategories: runSubFlowFieldCategories,
  fieldsToWatch: runSubFlowFieldsToWatch,
};

export default runSubFlow;
