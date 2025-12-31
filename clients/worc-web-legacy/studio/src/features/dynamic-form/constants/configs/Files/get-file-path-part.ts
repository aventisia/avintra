import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getFilePathPartFieldList: IDynamicFieldSchema[] = [
  {
    name: "filePath",
    type: "text",
    label: "File path",
    description: "The file path to use as the source.",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  // output verify the type of output
  // 1.
  {
    name: "o_rootPathOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The root path of the source file.",
    defaultValue: "RootPath",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_rootPathSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_rootPathSwitch",
    type: "output-switch-field",
    label: "RootPath",
    defaultValue: true,
  },

  // 2.
  {
    name: "o_directoryOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The directory of the source file.",
    defaultValue: "Directory",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_directorySwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_directorySwitch",
    type: "output-switch-field",
    label: "Directory",
    defaultValue: true,
  },

  // 3.
  {
    name: "o_fileNameOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The name of the source file.",
    defaultValue: "FileName",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_fileNameSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_fileNameSwitch",
    type: "output-switch-field",
    label: "FileName",
    defaultValue: true,
  },

  // 4.
  {
    name: "o_fileNameNoExtensionOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The name (without the extension) of the source file.",
    defaultValue: "FileNameNoExtension",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_fileNameNoExtensionSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_fileNameNoExtensionSwitch",
    type: "output-switch-field",
    label: "FileNameNoExtension",
    defaultValue: true,
  },

  // 5.
  {
    name: "o_fileExtensionOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The extension of the source file.",
    defaultValue: "FileExtension",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_fileExtensionSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_fileExtensionSwitch",
    type: "output-switch-field",
    label: "FileExtension",
    defaultValue: true,
  },
];

const getFilePathPartFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["filePath"]],
  },
  {
    title: "Output",
    formFieldKeys: [
      ["o_rootPathOutput", "o_rootPathSwitch"], 
      ["o_directoryOutput", "o_directorySwitch"], 
      ["o_fileNameOutput", "o_fileNameSwitch"], 
      ["o_fileNameNoExtensionOutput", "o_fileNameNoExtensionSwitch"], 
      ["o_fileExtensionOutput", "o_fileExtensionSwitch"],
    ],
  },
];

const getFilePathPart: ActivityConfig = {
  fieldList: getFilePathPartFieldList,
  fieldCategories: getFilePathPartFieldCategories,
  fieldsToWatch: [
    "o_rootPathOutput", "o_rootPathSwitch", 
    "o_directoryOutput", "o_directorySwitch", 
    "o_fileNameOutput", "o_fileNameSwitch", 
    "o_fileNameNoExtensionOutput", "o_fileNameNoExtensionSwitch", 
    "o_fileExtensionOutput", "o_fileExtensionSwitch",
  ],
};

export default getFilePathPart;
