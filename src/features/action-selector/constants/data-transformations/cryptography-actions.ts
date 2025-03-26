import { NodeDataType } from "@/types/node-data-type";

export const cryptographyActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "encryptTextWithAes",
    label: "Encrypt text with AES",
    description:
      "Encrypt a string with AES, using a key and a specified encoding format",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "decryptTextWithAes",
    label: "Decrypt text with AES",
    description:
      "Decrypt a string with AES based on a specified key and an encoding format",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "encryptFromFileWithAes",
    label: "Encrypt from file with AES",
    description:
      "Encrypt the contents of a file with AES, using a key and a specified encoding format",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "decryptToFileWithAes",
    label: "Decrypt to file with AES",
    description:
      "Decrypt a string to a file with AES based on a specified key and an encoding format",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "hashText",
    label: "Hash text",
    description:
      "Hash a string, using a specified algorithm and an encoding format",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "hashFromFile",
    label: "Hash from file",
    description:
      "Hash the contents of a file, using a specified algorithm and an encoding format",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "hashTextWithKey",
    label: "Hash text with key",
    description:
      "Hash a string with a key, using a specified algorithm and an encoding format",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "hashFromFileWithKey",
    label: "Hash from file with key",
    description:
      "Hash the contents of a file with a key, using a specified algorithm and an encoding format",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
