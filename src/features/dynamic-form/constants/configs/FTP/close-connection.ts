import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const closeConnectionFieldList: IDynamicFieldSchema[] = [
  {
    name: "connection",
    type: "text",
    label: "Connection",
    description: "The FTP connection.",
    defaultValue: "",
  },
];

const closeConnectionFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["connection"]],
  },
];

const closeConnection: ActivityConfig = {
  fieldList: closeConnectionFieldList,
  fieldCategories: closeConnectionFieldCategories,
  fieldsToWatch: [],
};

export default closeConnection;
