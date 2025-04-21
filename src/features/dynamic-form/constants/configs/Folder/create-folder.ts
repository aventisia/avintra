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
    name: "o_newFolderOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The created folder object",
    defaultValue: "NewFolder",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_newFolderSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_newFolderSwitch",
    type: "output-switch-field",
    label: "NewFolder",
    defaultValue: true,
  },
];

const createFolderFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["createNewFolderInto"], ["newFolderName"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_newFolderOutput", "o_newFolderSwitch"]],
  },
];


const createFolder: ActivityConfig = {
  fieldList: createFolderFieldList,
  fieldCategories: createFolderFieldCategories,
  fieldsToWatch: ["o_newFolderOutput", "o_newFolderSwitch"],
};

export default createFolder;
