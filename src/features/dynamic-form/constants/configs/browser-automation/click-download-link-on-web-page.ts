import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const clickDownloadLinkOnWebPageFieldList: IDynamicFieldSchema[] = [
  {
    name: "webBrowserInstance",
    type: "text",
    label: "Web browser instance",
    description:
      "Enter or choose the variable that contains the web browser instance to work with",
    defaultValue: "",
  },
  {
    name: "uIElement",
    type: "ui-element-selector",
    label: "UI element",
    description: "Select the text field to populate",
    defaultValue: "",
  },
  {
    name: "destinationFolder",
    type: "text",
    label: "Destination folder",
    description:
      "Enter or choose the full path of the folder, or a variable containing the folder, to save the downloaded file to",
    defaultValue: "",
  },
  // output
  {
    name: "downloadedFile",
    type: "switch",
    label: "DownloadedFile",
    description:
      "The file on the disk where the download is saved. This value is a filepath that consists of the download folder as specified above plus the name of the file as provided by the web server.",
    defaultValue: true,
  },
];

const clickDownloadLinkOnWebPageFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["webBrowserInstance"],
      ["uIElement"],
      ["destinationFolder"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["downloadedFile"]],
  },
];

const clickDownloadLinkOnWebPage: ActivityConfig = {
  fieldList: clickDownloadLinkOnWebPageFieldList,
  fieldCategories: clickDownloadLinkOnWebPageFieldCategories,
  fieldsToWatch: [],
};

export default clickDownloadLinkOnWebPage;
