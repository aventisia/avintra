import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const hashTextList: IDynamicFieldSchema[] = [
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
    name: "textToHash",
    type: "text",
    label: "Text to hash",
    description: "The text to hash",
    defaultValue: "",
  },
];

const hashTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["hashAlgorithm"], ["encoding"], ["textToHash"]],
  },
];

const hashText: ActivityConfig = {
  fieldList: hashTextList,
  fieldCategories: hashTextFieldCategories,
  fieldsToWatch: [],
};

export default hashText;
