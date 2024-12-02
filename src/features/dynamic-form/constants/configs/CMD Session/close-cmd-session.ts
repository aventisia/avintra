import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const closeCmdSessionFieldList: IDynamicFieldSchema[] = [
  {
    name: "cmdSession",
    type: "select",
    label: "CMD session",
    description:
      "The CMD session to close. Specify this variable in an open CMD session action",
    selectOptions: [],
    defaultValue: "",
  },
];

const closeCmdSessionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["cmdSession"]],
  },
];

const closeCmdSession: ActivityConfig = {
  fieldList: closeCmdSessionFieldList,
  fieldCategories: closeCmdSessionFieldCategories,
  fieldsToWatch: [],
};

export default closeCmdSession;
