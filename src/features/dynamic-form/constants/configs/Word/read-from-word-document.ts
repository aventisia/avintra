import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const readFromWordDocumentFieldList: IDynamicFieldSchema[] = [
  {
    name: "wordInstance",
    type: "select",
    label: "Word Instance",
    description:
      "The Word instance to work with. This variable must have been previously specified in a Launch Word or Attach to running Word action",
    selectOptions: [],
    defaultValue: "",
  },
  {
    name: "retrieve",
    type: "select",
    label: "Retrieve",
    description:
      "Whether to retrieve the content of the whole document, of specific pages or a bookmark",
    selectOptions: [
      { label: "Whole Document", value: "Whole Document" },
      { label: "Pages", value: "Pages" },
      { label: "Bookmark", value: "Bookmark" },
    ],
    defaultValue: "Whole Document",
  },
  {
    name: "pages",
    type: "text",
    label: "Pages",
    description:
      "The page of the Word document to be read. A range of pages or a list can be provided as 2-5, read from page 2 to page 5, or 2,3,7 read pages 2,3,7.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "retrieve", value: "Pages" }],
          },
        ],
      },
    },
  },
  {
    name: "bookmark",
    type: "text",
    label: "Bookmark",
    description: "The bookmark of the Word document to be read",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "retrieve", value: "Bookmark" }],
          },
        ],
      },
    },
  },
  {
    name: "wordData",
    type: "switch",
    label: "WordData",
    description: "The value of the retrieved content",
    defaultValue: "",
  },
];

const readFromWordDocumentFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Document Content Retrieval",
    formFieldKeys: [["wordInstance"], ["retrieve"], ["pages"], ["bookmark"]],
  },
  {
    title: "Output",
    formFieldKeys: [["wordData"]],
  },
];

const readFromWordDocument: ActivityConfig = {
  fieldList: readFromWordDocumentFieldList,
  fieldCategories: readFromWordDocumentFieldCategories,
  fieldsToWatch: ["retrieve"],
};

export default readFromWordDocument;
