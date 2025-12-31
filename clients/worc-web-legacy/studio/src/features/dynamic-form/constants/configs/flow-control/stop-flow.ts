import {
  ActivityConfig,
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
} from "../../../types/dynamic-form-types";

const stopFlowFieldList: IDynamicFieldSchema[] = [
  {
    name: "endFlow", // to watch
    type: "select",
    label: "End flow",
    description: "Terminate the flow run either successfully or with an error",
    selectOptions: [
      { label: "Successfully", value: "successfully" },
      { label: "With error message", value: "withErrorMessage" },
    ],
    defaultValue: "successfully",
  },
  {
    name: "errorMessage",
    type: "text",
    label: "Error message",
    description: "The error message to return to the flow caller upon",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "endFlow", value: "withErrorMessage" }],
          },
        ],
        initialState: false,
      },
    },
  },
];

const stopFlowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["endFlow"], ["errorMessage"]],
  },
];
const stopFlowFieldsToWatch: string[] = ["endFlow"];

const stopFlow: ActivityConfig = {
  fieldList: stopFlowFieldList,
  fieldCategories: stopFlowFieldCategories,
  fieldsToWatch: stopFlowFieldsToWatch,
};

export default stopFlow;
