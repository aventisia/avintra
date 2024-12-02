import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const createFolderFieldList: IDynamicFieldSchema[] = [
  {
    name: "createNewFolderInto",
    type: "text",
    label: "Create new folder into",
    description:
      "Enter or choose the full path of the folder, or the variable containing the folder, to create a new folder in",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  {
    name: "newFolderName",
    type: "text",
    label: "New folder name",
    description:
      "Enter the text, or a text variable, to be the name of the new folder",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  //  output
  {
    name: "newFolder",
    type: "switch",
    label: "NewFolder",
    description: "The created folder object",
    defaultValue: false,
  },
];

const createFolderFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["createNewFolderInto"], ["newFolderName"]],
  },
  {
    title: "Output",
    formFieldKeys: [["newFolder"]],
  },
];


const createFolder: ActivityConfig = {
  fieldList: createFolderFieldList,
  fieldCategories: createFolderFieldCategories,
  fieldsToWatch: [],
};

export default createFolder;
