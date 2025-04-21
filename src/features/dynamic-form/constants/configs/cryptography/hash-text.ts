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
  // Output
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
        initialState: true,
      },
    },
  },
  {
    name: "o_hashedTextSwitch", //to watch
    type: "output-switch-field",
    label: "HashedText",
    defaultValue: true,
  },
];

const hashTextFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["hashAlgorithm"], ["encoding"], ["textToHash"]],
  },
  {
    title: "Output",
    formFieldKeys: [["o_hashedTextOutput", "o_hashedTextSwitch"]]
  }
];

const hashText: ActivityConfig = {
  fieldList: hashTextList,
  fieldCategories: hashTextFieldCategories,
  fieldsToWatch: ["o_hashedTextOutput", "o_hashedTextSwitch"],
};

export default hashText;
