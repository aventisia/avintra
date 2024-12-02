import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const launchOutlookFieldList: IDynamicFieldSchema[] = [
  {
    name: "outlookInstance",
    type: "switch",
    label: "OutlookInstance",
    description:
      "The specific Outlook instance for use with later Outlook actions",
    defaultValue: true,
  },
];
const launchOutlookFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Output",
    formFieldKeys: [["outlookInstance"]],
  },
];
const launchOutlook: ActivityConfig = {
  fieldList: launchOutlookFieldList,
  fieldCategories: launchOutlookFieldCategories,
  fieldsToWatch: [],
};

export default launchOutlook;
