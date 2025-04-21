import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const launchOutlookFieldList: IDynamicFieldSchema[] = [
  {
    name: "o_outlookInstanceOutput", //to watch
    type: "output-text-field",
    label: "",
    description:
      "The specific Outlook instance for use with later Outlook actions",
    defaultValue: "OutlookInstance",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_outlookInstanceSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_outlookInstanceSwitch",
    type: "output-switch-field",
    label: "OutlookInstance",
    defaultValue: true,
  },
];
const launchOutlookFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Output",
    formFieldKeys: [["o_outlookInstanceOutput", "o_outlookInstanceSwitch"]],
  },
];
const launchOutlook: ActivityConfig = {
  fieldList: launchOutlookFieldList,
  fieldCategories: launchOutlookFieldCategories,
  fieldsToWatch: ["o_outlookInstanceOutput", "o_outlookInstanceSwitch"],
};

export default launchOutlook;
