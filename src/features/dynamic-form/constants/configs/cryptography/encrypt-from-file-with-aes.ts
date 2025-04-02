import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const encryptFromFileWithAesFieldList: IDynamicFieldSchema[] = [
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
    name: "fileToEncrypt",
    type: "text",
    label: "File to encrypt",
    description: "The text file that stores the contents to encrypt",
    defaultValue: "",
  },
  {
    name: "encryptionKey",
    type: "password",
    label: "Encryption key",
    description: "The encryption key to use",
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
  name: "o_encryptedTextOutput",//to watch
  type: "output-text-field",
  label: "",
  description: "The encrypted text for later processing",
  defaultValue: "EncryptedText",
  regOptions: {
    disabledBasedOnFields: {
      conditionList: [
        {
          fields: [{ key: "o_encryptedTextSwitch", value: false }],
        },
      ],
      initialState: true,
    },
  },
},
{
  name: "o_encryptedTextSwitch", //to watch
  type: "output-switch-field",
  label: "EncryptedText",
  defaultValue: true,
},
{
  name: "o_saltOutput",//to watch
  type: "output-text-field",
  label: "",
  description: "The randomly generated salt value for later processing",
  defaultValue: "Salt",
  regOptions: {
    disabledBasedOnFields: {
      conditionList: [
        {
          fields: [{ key: "o_saltSwitch", value: false }],
        },
      ],
      initialState: true,
    },
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
  name: "o_saltSwitch",
  type: "output-switch-field",
  label: "Salt",
  defaultValue: true,
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
  name: "o_initializationVectorOutput",//to watch
  type: "output-text-field",
  label: "",
  description:
    "The randomly generated initialization vector value for later processing",
  defaultValue: "InitializationVector",
  regOptions: {
    disabledBasedOnFields: {
      conditionList: [
        {
          fields: [{ key: "o_initializationVectorSwitch", value: false }],
        },
      ],
      initialState: true,
    },
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
  name: "o_initializationVectorSwitch",
  type: "output-switch-field",
  label: "InitializationVector",
  defaultValue: true,
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
];

const encryptFromFileWithAesFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["encoding"], ["fileToEncrypt"], ["encryptionKey"]],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["padding"],
      ["keySize"],
      ["useSalt"],
      ["iterations"],
      ["useInitializationVector"],
      ["hashAlgorithm"]
    ],
  },
  {
    title: "Output",
    formFieldKeys: [
      ["o_encryptedTextOutput", "o_encryptedTextSwitch"], 
      ["o_saltOutput", "o_saltSwitch"], 
      ["o_initializationVectorOutput", "o_initializationVectorSwitch"]
    ],
  },
];

const encryptFromFileWithAes: ActivityConfig = {
  fieldList: encryptFromFileWithAesFieldList,
  fieldCategories: encryptFromFileWithAesFieldCategories,
  fieldsToWatch: [
    "useSalt", 
    "useInitializationVector",
    "o_encryptedTextOutput", 
    "o_encryptedTextSwitch", 
    "o_saltOutput", 
    "o_saltSwitch", 
    "o_initializationVectorOutput", 
    "o_initializationVectorSwitch"
  ],
};

export default encryptFromFileWithAes;
