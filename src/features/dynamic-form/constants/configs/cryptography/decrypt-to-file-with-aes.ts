import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const decryptToFileWithAesFieldList: IDynamicFieldSchema[] = [
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
    name: "decryptToFile",
    type: "text",
    label: "Decrypt to file",
    description: "The file to save the decrypted text into",
    defaultValue: "",
  },
  {
    name: "ifFileExists",
    type: "select",
    label: "If file exists",
    description:
      "Specifies what to do in case the destination file already exists",
    selectOptions: [
      { label: "Overwrite", value: "overwrite" },
      { label: "Don't decrypt to file", value: "don't decrypt to file" },
      { label: "Add sequential suffix", value: "add sequential suffix" },
    ],
    defaultValue: "add sequential suffix",
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
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "useSalt", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "iterations",
    type: "text",
    label: "Iterations",
    description: "The number of iterations to use. Note that, in order to decrypt the output, the same iterations must be used. Use iteration count of at least 100000, to reduce risks against brute force attacks.",
    defaultValue: "100000",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "useSalt", value: true }],
          },
        ],
        initialState: false,
      },
    },
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
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "useInitializationVector", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "hashAlgorithm",
    type: "select",
    label: "Hash algorithm",
    description: "The size of the key in bits to use for the encryption",
    selectOptions: [
      { label: "SHA1", value: "sha1" },
      { label: "SHA256", value: "sha256" },
      { label: "SHA384", value: "sha384" },
      { label: "SHA512", value: "sha512" },
    ],
    defaultValue: "sha256",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "useSalt", value: true }],
          },
        ],
        initialState: false,
      },
    },
  },
  // output
  {
    name: "o_decryptedFileOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The decrypted file for later processing",
    defaultValue: "DecryptedFile",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_decryptedFileSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_decryptedFileSwitch",
    type: "output-switch-field",
    label: "DecryptedFile",
    defaultValue: true,
  },
];

const decryptToFileWithAesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["encoding"],
      ["TextToDecrypt"],
      ["decryptionKey"],
      ["decryptToFile"],
      ["ifFileExists"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["padding"],
      ["keySize"],
      ["useSalt"],
      ["salt"],
      ["iterations"],
      ["useInitializationVector"],
      ["initializationVector"],
      ["hashAlgorithm"]
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_decryptedFileOutput", "o_decryptedFileSwitch"]],
  },
];

const decryptToFileWithAes: ActivityConfig = {
  fieldList: decryptToFileWithAesFieldList,
  fieldCategories: decryptToFileWithAesFieldCategories,
  fieldsToWatch: ["useSalt", "useInitializationVector", "o_decryptedFileOutput", "o_decryptedFileSwitch"],
};

export default decryptToFileWithAes;
