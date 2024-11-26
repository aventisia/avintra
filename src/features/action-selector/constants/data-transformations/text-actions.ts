import { NodeDataType } from "@/types/node-data-type";

export const textActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "useTheRecognizeEntitiesInTextAction",
    label: "Use the Recognize entities in text action",
    description:
      "Desktop flows enable you to extract various entities from texts in natural language, such as numbers, dates, and measurement units, through the Recognize entities in text action",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "appendLineToText",
    label: "Append line to text",
    description: "Appends a new line of text to a text value",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getSubtext",
    label: "Get subtext",
    description: "Retrieve a subtext from a text value",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "cropText",
    label: "Crop text",
    description:
      "Retrieves a text value that occurs before, after or between the specified text flag(s) in a given text",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "padText",
    label: "Pad text",
    description:
      "Creates a fixed length text by adding characters to the left or to the right of an existing text",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "trimText",
    label: "Trim text",
    description:
      "Removes all occurrences of white space characters (such as space, tab, or new line) from the beginning and/or end of an existing text",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "reverseText",
    label: "Reverse text",
    description: "Reverses the order of letters in a text string",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "changeTextCase",
    label: "Change text case",
    description:
      "Changes the casing of a text to uppercase, lowercase, title case or sentence case",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "convertTextToNumber",
    label: "Convert text to number",
    description:
      "Converts a text representation of a number to a variable that contains a numeric value",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "convertNumberToText",
    label: "Convert number to text",
    description: "Converts a number to text using a specified format",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "convertTextToDatetime",
    label: "Convert text to datetime",
    description:
      "Converts a text representation of a date and/or time value to a datetime value",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "convertDatetimeToText",
    label: "Convert datetime to text",
    description:
      "Converts a datetime value to text using a specified custom format",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "createRandomText",
    label: "Create random text",
    description:
      "Generates a text of specified length consisting of random characters. This action can be useful for generating passwords",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "joinText",
    label: "Join text",
    description:
      "Converts a list into a text value by separating its items with a specified delimiter",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "splitText",
    label: "Split text",
    description:
      "Creates a list containing the substrings of a text that are separated by a specified delimiter or a regular expression",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "parseText",
    label: "Parse text",
    description:
      "Parses a text to find the first or all occurrences of a specified subtext or a regular expression pattern",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "replaceText",
    label: "Replace text",
    description:
      "Replaces all occurrences of a specified subtext with another text. It can also be used with regular expressions",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "escapeTextForRegularExpression",
    label: "Escape text for regular expression",
    description:
      "Escapes a minimal set of characters (, *, +, ?, |, {, [, (,), ^, $,., #, and white space) by replacing them with their escape codes",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "recognizeEntitiesInText",
    label: "Recognize entities in text",
    description:
      "Recognizes entities in text, such as numbers, units, data/time and others expressed in natural language across multiple languages",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "createHtmlContent",
    label: "Create HTML content",
    description: "Generates rich HTML content and stores it in a variable",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
