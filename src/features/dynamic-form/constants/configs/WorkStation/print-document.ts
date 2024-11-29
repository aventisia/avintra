import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const printDocumentFieldList: IDynamicFieldSchema[] = [
  {
    name: "documentToPrint",
    type: "text",
    label: "Document to print",
    description: "The path of the document to print",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
];

const printDocumentFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["documentToPrint"]],
  },
];

const printDocument: ActivityConfig = {
  fieldList: printDocumentFieldList,
  fieldCategories: printDocumentFieldCategories,
  fieldsToWatch: [],
};

export default printDocument;
