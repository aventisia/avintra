import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const insertImageInWordDocumentFieldList: IDynamicFieldSchema[] = [
  {
    name: "wordInstance",
    type: "select",
    label: "Word Instance",
    description:
      "The Word instance to work with. This variable must have been previously specified in a Launch Word or Attach to running Word action",
    selectOptions: [], // Add available Word instances here if needed
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "insertImageTo",
    type: "select",
    label: "Insert image to",
    description:
      "Specifies the position of the Word document that image will be appended",
    selectOptions: [
      {
        label: "Beginning of the Word file",
        value: "Beginning of the Word file",
      },
      { label: "End of the Word file", value: "End of the Word file" },
      { label: "Before Bookmark", value: "Before Bookmark" },
      { label: "After Bookmark", value: "After Bookmark" },
      { label: "Before specific text", value: "Before specific text" },
      { label: "After specific text", value: "After specific text" },
    ],
    defaultValue: "End of the Word file",
    regOptions: {
      required: true,
    },
  },
  {
    name: "bookmark",
    type: "text",
    label: "Bookmark",
    description:
      "The target bookmark in the Word document where the image will be inserted. This field is required only if 'Before Bookmark' or 'After Bookmark' is selected.",
    defaultValue: "",
    regOptions: {
      required: false,
    },
  },
  {
    name: "textToFind",
    type: "text",
    label: "Text to find",
    description:
      "The text to find in the Word document for inserting the image. This field is required if 'Before specific text' or 'After specific text' is selected.",
    defaultValue: "",
    regOptions: {
      required: false,
    },
  },
  {
    name: "insertImageFrom",
    type: "select",
    label: "Insert image from",
    description:
      "The location of the image to be inserted into the specified Word document",
    selectOptions: [
      { label: "File", value: "File" },
      { label: "Clipboard", value: "Clipboard" },
    ],
    defaultValue:""
  },
  {
    name: "imagePath",
    type: "text",
    label: "Image path",
    description:
      "The full path of the image to be inserted. This field is required if 'File' is selected in 'Insert image from'.",
    defaultValue: "",
    regOptions: {
      requiredBasedOnFields: {
        initialState: false,
        conditionList: [
          {
            fields: [{ key: "insertImageFrom", value: "File" }],
          },
        ],
      },
    },
  },
];

const insertImageInWordDocumentFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["wordInstance"],
      ["insertImageTo"],
      ["bookmark"],
      ["textToFind"],
      ["insertImageFrom"],
      ["imagePath"],
    ],
  },
];

const insertImageInWordDocument: ActivityConfig = {
  fieldList: insertImageInWordDocumentFieldList,
  fieldCategories: insertImageInWordDocumentFieldCategories,
  fieldsToWatch: ["insertImageFrom"],
};

export default insertImageInWordDocument;
