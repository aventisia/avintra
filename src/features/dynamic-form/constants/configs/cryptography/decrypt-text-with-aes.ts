import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const decryptTextWithAesFieldList: IDynamicFieldSchema[] = [
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
    name: "TextToDecrypt",
    type: "text",
    label: "Text to decrypt",
    description: "The text to decrypt in the form of a base64 string",
    defaultValue: "",
  },
  {
    name: "decryptionKey",
    type: "password",
    label: "Decryption key",
    description: "	The decryption key to use",
    defaultValue: "",
  },
  {
    name: "padding",
    type: "select",
    label: "Padding",
    description: "The padding to use for the selected encryption algorithm",
    selectOptions: [
      { label: "None", value: "none" },
      { label: "PKCS7", value: "pKCS7" },
      { label: "Zeros", value: "zeros" },
      { label: "ANSIX923", value: "aNSIX923" },
      { label: "ISO10126", value: "iSO10126" },
    ],
    defaultValue: "pKCS7",
  },
  {
    name: "keySize",
    type: "select",
    label: "Key size",
    description: "The size of the key in bits to use for the encryption",
    selectOptions: [
      { label: "128 bits", value: "128 Bits" },
      { label: "192 bits", value: "192 Bits" },
      { label: "256 bits", value: "256 Bits" },
    ],
    defaultValue: "256 Bits",
  },
  {
    name: "useSalt",
    type: "switch",
    label: "Use salt",
    description:
      "Specifies whether to use salt for encryption. When this option is enabled, the randomly generated salt becomes an output in the form of a base64 string.",
    defaultValue: false,
  },
  {
    name: "salt",
    type: "text",
    label: "Salt",
    description: "The randomly generated salt value for later processing",
    defaultValue: "",
  },
  {
    name: "useInitializationVector",
    type: "switch",
    label: "Use initialization vector",
    description:
      "Specifies whether to use an initialization vector. When this option is enabled, the randomly generated initialization vector becomes an output in the form of a base64 string",
    defaultValue: false,
  },
  {
    name: "initializationVector",
    type: "text",
    label: "InitializationVector",
    description:
      "The randomly generated initialization vector value for later processing",
    defaultValue: "",
  },
  // output
  {
    name: "o_decryptedTextOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The decrypted text for later processing",
    defaultValue: "DecryptedText",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_decryptedTextSwitch", value: false }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "o_decryptedTextSwitch",
    type: "output-switch-field",
    label: "DecryptedText",
    defaultValue: true,
  },
];

const decryptTextWithAesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["encoding"],
      ["TextToDecrypt"],
      ["decryptionKey"],
      ["initializationVector"],
      ["salt"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["padding"],
      ["keySize"],
      ["useSalt"],
      ["useInitializationVector"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_decryptedTextOutput", "o_decryptedTextSwitch"]],
  },
];

const decryptTextWithAes: ActivityConfig = {
  fieldList: decryptTextWithAesFieldList,
  fieldCategories: decryptTextWithAesFieldCategories,
  fieldsToWatch: ["o_decryptedTextOutput", "o_decryptedTextSwitch"],
};

export default decryptTextWithAes;
