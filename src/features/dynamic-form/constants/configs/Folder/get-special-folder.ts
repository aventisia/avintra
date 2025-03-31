import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const getSpecialFolderFieldList: IDynamicFieldSchema[] = [
  {
    name: "specialFolderName",
    type: "select",
    label: "Special folder name",
    description:
      "Choose the name of the special folder. This will be independent of path, to find the special folder on any computer regardless of path specifics.",
    selectOptions: [
      { label: "Programs", value: "Programs" },
      { label: "Documents", value: "Documents" },
      { label: "Favorites", value: "Favorites" },
      { label: "Startup", value: "Startup" },
      { label: "Recent", value: "Recent" },
      { label: "Send to", value: "SendTo" },
      { label: "Start Menu", value: "StartMenu" },
      { label: "Music", value: "Music" },
      { label: "Desktop", value: "Desktop" },
      { label: "Templates", value: "Templates" },
      { label: "Application data", value: "ApplicationData" },
      { label: "Local application data", value: "LocalApplicationData" },
      { label: "Internet cache", value: "InternetCache" },
      { label: "Cookies", value: "Cookies" },
      { label: "History", value: "History" },
      { label: "Common application data", value: "CommonApplicationData" },
      { label: "System", value: "System" },
      { label: "Program files", value: "ProgramFiles" },
      { label: "Pictures", value: "Pictures" },
      { label: "Common program files", value: "CommonProgramFiles" },
    ],
    defaultValue: "Desktop",
    regOptions: {
      required: true,
    },
  },
  {
    name: "folderPath",
    type: "text",
    label: "Special folder path",
    description:
      "This is the path of the selected special folder for this computer",
    defaultValue: "",
    regOptions: {
      required: true,
    },
  },
  //   output 
  {
    name: "specialFolderPath",
    type: "switch",
    label: "SpecialFolderPath",
    description: "The special folder object",
    defaultValue: "",
  },
];

const getSpecialFolderFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["specialFolderName"], ["folderPath"]],
  },
  {
    title: "Output",
    formFieldKeys: [["specialFolderPath"]],
  },
];

const getSpecialFolder: ActivityConfig = {
  fieldList: getSpecialFolderFieldList,
  fieldCategories: getSpecialFolderFieldCategories,
  fieldsToWatch: [],
};

export default getSpecialFolder;