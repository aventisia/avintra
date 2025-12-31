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
    name: "textToHash",
    type: "text",
    label: "Text to hash",
    description: "The text to hash",
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
    name: "o_hashedTextOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The hashed text for later processing",
    defaultValue: "HashedText",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_hashedTextSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_hashedTextSwitch",
    type: "output-switch-field",
    label: "HashedText",
    defaultValue: true,
  },
];

const hashTextWithKeyFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["hashAlgorithm"],
      ["encoding"],
      ["textToHash"],
      ["hashKey"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_hashedTextOutput", "o_hashedTextSwitch"]],
  },
];

const hashTextWithKey: ActivityConfig = {
  fieldList: hashTextWithKeyFieldList,
  fieldCategories: hashTextWithKeyFieldCategories,
  fieldsToWatch: ["o_hashedTextOutput", "o_hashedTextSwitch"],
};

export default hashTextWithKey;
