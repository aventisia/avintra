import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const hashTextWithKeyFieldList: IDynamicFieldSchema[] = [
  {
    name: "hashAlgorithm",
    type: "select",
    label: "Hash algorithm",
    description: "The algorithm to use for hashing",
    selectOptions: [
      { label: "HMAC SHA256", value: "hMAC SHA256" },
      { label: "HMAC SHA384", value: "hMAC SHA384" },
      { label: "HMAC SHA512", value: "hMAC SHA512" },
    ],
    defaultValue: "hMAC SHA256",
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
    description: "	The file to hash the contents of",
    defaultValue: "",
  },
  {
    name: "hashKey",
    type: "password",
    label: "Hash key",
    description: "The key to hash the text with",
    defaultValue: "",
  },
  // output
  {
    name: "hashedText",
    type: "text",
    label: "HashedText",
    description: "The hashed text for later processing",
    defaultValue: "",
  },
];

const hashTextWithKeyFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["hashAlgorithm"],
      ["encoding"],
      ["fileToHash"],
      ["hashKey"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["hashedText"]],
  },
];

const hashFromFileWithKey: ActivityConfig = {
  fieldList: hashTextWithKeyFieldList,
  fieldCategories: hashTextWithKeyFieldCategories,
  fieldsToWatch: [],
};

export default hashFromFileWithKey;
