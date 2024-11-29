import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const hashFromFileFieldList: IDynamicFieldSchema[] = [
  {
    name: "hashAlgorithm",
    type: "select",
    label: "Hash algorithm",
    description: "The algorithm to use for hashing",
    selectOptions: [
      { label: "SHA256", value: "sHA256" },
      { label: "SHA384", value: "sHA384" },
      { label: "SHA512", value: "sHA512" },
    ],
    defaultValue: "sHA256",
  },
  {
    name: "encoding",
    type: "select",
    label: "Encoding",
    description: "The encoding of the text to hash",
    selectOptions: [
      { label: "System default", value: "system default" },
      { label: "ASCII", value: "aSCII" },
      { label: "Unicode", value: "unicode" },
      { label: "Big-endian Unicode", value: "big-endian Unicode" },
      { label: "UTF-8", value: "uTF-8" },
    ],
    defaultValue: "unicode",
  },
  {
    name: "fileToHash",
    type: "text",
    label: "File to hash",
    description: "The file to hash the contents of",
    defaultValue: "",
  },
];

const hashFromFileFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["hashAlgorithm"], ["encoding"], ["fileToHash"]],
  },
];

const hashFromFile: ActivityConfig = {
  fieldList: hashFromFileFieldList,
  fieldCategories: hashFromFileFieldCategories,
  fieldsToWatch: [],
};

export default hashFromFile;
