import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const ifTextOnScreenOCRFieldList: IDynamicFieldSchema[] = [
  {
    name: "ifText",
    type: "select",
    label: "If text",
    description:
      "Specifies whether to check if the text exists or not on the given source to analyze",
    selectOptions: [
      { label: "Exists", value: "exists" },
      { label: "Doesn't exist", value: "doesn't exist" },
    ],
    defaultValue: "exists",
  },
  {
    name: "OCREngineType", // to watch
    type: "select",
    label: "OCR engine type",
    description: "",
    selectOptions: [
      { label: "Windows OCR engine", value: "windows OCR engine" },
      { label: "Tesseract engine", value: "tesseract engine" },
      { label: "OCR engine variable", value: "oCR engine variable" },
    ],
    defaultValue: "windows OCR engine",
  },
  {
    name: "oCREngineVariable",
    type: "text",
    label: "OCR engine variable",
    description: "The engine to use for the OCR operation",
    defaultValue: "",
  },
  {
    name: "textToFind",
    type: "text",
    label: "Text to find",
    description: "The text to search for in the specified source",
    defaultValue: "",
  },
  {
    name: "isRegularExpression",
    type: "switch",
    label: "Is regular expression",
    description:
      "Specifies whether to use a regular expression to find the specified text",
    defaultValue: false,
  },
  {
    name: "searchForTextOn",
    type: "select",
    label: "Search for text on",
    description:
      "Specifies whether to search for the specified text on the entire visible screen or just the foreground window",
    selectOptions: [
      { label: "Entire screen", value: "entire screen" },
      { label: "Foreground window", value: "foreground window" },
    ],
    defaultValue: "entire screen",
  },
  {
    name: "searchMode",
    type: "select",
    label: "Search mode",
    description:
      "Specifies whether to scan the entire screen (or window) or a narrowed down subregion of it",
    selectOptions: [
      {
        label: "Whole of specified source",
        value: "whole of specified source",
      },
      { label: "Specific subregion only", value: "specific subregion only" },
      {
        label: "Subregion relative to image",
        value: "subregion relative to image",
      },
    ],
    defaultValue: "whole of specified source",
  },
  {
    name: "image(s)",
    type: "text",
    label: "Image(s)",
    description:
      "The image(s) specifying the subregion (relative to the top left corner of the image) to scan for the supplied text",
    defaultValue: "",
  },
  {
    name: "x1",
    type: "number",
    label: "X1",
    description:
      "The start X coordinate of the subregion to scan for the supplied tex",
    defaultValue: "",
  },
  {
    name: "tolerance",
    type: "select",
    label: "Tolerance",
    description:
      "Specifies how much the image(s) searched for can differ from the originally chosen image",
    selectOptions: [],
    defaultValue: "10",
  },
  {
    name: "y1",
    type: "number",
    label: "Y1",
    description:
      "The start Y coordinate of the subregion to scan for the supplied text",
    defaultValue: "",
  },
  {
    name: "x1",
    type: "number",
    label: "X1",
    description:
      "The start X coordinate of the subregion relative to the specified image to scan for the supplied text",
    defaultValue: "",
  },
  {
    name: "x2",
    type: "number",
    label: "X2",
    description:
      "The end X coordinate of the subregion to scan for the supplied text",
    defaultValue: "",
  },
  {
    name: "y1",
    type: "number",
    label: "Y1",
    description:
      "The start Y coordinate of the subregion relative to the specified image to scan for the supplied text",
    defaultValue: "",
  },
  {
    name: "y2",
    type: "number",
    label: "Y2",
    description:
      "The end Y coordinate of the subregion relative to the specified image to scan for the supplied text",
    defaultValue: "",
  },
  {
    name: "windowsOcrLanguage",
    type: "select",
    label: "Windows OCR language",
    description: "The language of the text that the Windows OCR engine detects",
    selectOptions: [
      { label: "Chinese (Simplified)", value: "Chinese (Simplified)" },
      { label: "Chinese (Traditional)", value: "Chinese (Traditional)" },
      { label: "Czech", value: "Czech" },
      { label: "Danish", value: "Danish" },
      { label: "Dutch", value: "Dutch" },
      { label: "English", value: "english" },
      { label: "Finnish", value: "Finnish" },
      { label: "French", value: "French" },
      { label: "German", value: "German" },
      { label: "Greek", value: "Greek" },
      { label: "Hungarian", value: "Hungarian" },
      { label: "Italian", value: "Italian" },
      { label: "Japanese", value: "Japanese" },
      { label: "Korean", value: "Korean" },
      { label: "Norwegian", value: "Norwegian" },
      { label: "Polish", value: "Polish" },
      { label: "Portuguese", value: "Portuguese" },
      { label: "Romanian", value: "Romanian" },
      { label: "Russian", value: "Russian" },
      { label: "Serbian (Cyrillic)", value: "Serbian (Cyrillic)" },
      { label: "Serbian (Latin)", value: "Serbian (Latin)" },
      { label: "Slovak", value: "Slovak" },
      { label: "Spanish", value: "Spanish" },
      { label: "Swedish", value: "Swedish" },
      { label: "Turkish", value: "Turkish" },
    ],
    defaultValue: "english",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "OCREngineType", value: "windows OCR engine" }],
          },
        ],
        initialState: true,
      },
    },
  },
  {
    name: "useOtherLanguage",
    type: "switch",
    label: "Use other language",
    description:
      "Specifies whether to use a language not given in the 'Tesseract language' field",
    defaultValue: false,
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "OCREngineType", value: "tesseract engine" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "tesseractLanguage",
    type: "select",
    label: "Tesseract language",
    description: "The language of the text that the Tesseract engine detects",
    selectOptions: [
      { label: "English", value: "english" },
      { label: "German", value: "german" },
      { label: "Spanish", value: "spanish" },
      { label: "French", value: "french" },
      { label: "Italian", value: "italian" },
    ],
    defaultValue: "english",
    regOptions: {
      requiredBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "OCREngineType", value: "tesseract engine" }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "languageAbbreviation",
    type: "text",
    label: "Language abbreviation",
    description:
      "The Tesseract abbreviation of the language to use. For example, if the data is 'eng.traineddata', set this parameter to 'eng'",
    defaultValue: "",
  },
  {
    name: "languageDataPath",
    type: "text",
    label: "Language data path",
    description:
      "The path of the folder that holds the specified language's Tesseract data",
    defaultValue: "",
  },
  {
    name: "imageWidthMultiplier",
    type: "number",
    label: "Image width multiplier",
    description: "The width multiplier of the image",
    selectOptions: [],
    defaultValue: "1",
  },
  {
    name: "imageHeightMultiplier",
    type: "number",
    label: "Image height multiplier",
    description: "The height multiplier of the image",
    selectOptions: [],
    defaultValue: "1",
  },
  {
    name: "imageMatchingAlgorithm",
    type: "select",
    label: "Image matching algorithm",
    description: "Which image algorithm to use when searching for image",
    selectOptions: [
      { label: "Basic", value: "basic" },
      { label: "Advanced", value: "advanced" },
    ],
    defaultValue: "basic",
  },
  // output
  {
    name: "locationOfTextFoundX",
    type: "number",
    label: "LocationOfTextFoundX",
    description:
      "The X coordinate of the point where the text appears on the screen. If the search is performed in the foreground window, the coordinate returned is relative to the top left corner of the window",
    defaultValue: "",
  },
  {
    name: "locationOfTextFoundY",
    type: "number",
    label: "LocationOfTextFoundY",
    description:
      "The X coordinate of the point where the text appears on the screen. If the search is performed in the foreground window, the coordinate returned is relative to the top left corner of the window",
    defaultValue: "",
  },
];

const ifTextOnScreenOCRFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["ifText"],
      ["OCREngineType"],
      ["oCREngineVariable"],
      ["textToFind"],
      ["isRegularExpression"],
      ["searchForTextOn"],
      ["searchMode"],
      ["image(s)"],
      ["x1"],
      ["tolerance"],
      ["y1"],
      ["x1"],
      ["x2"],
      ["y1"],
      ["y2"],
      ["x2"],
      ["y2"],
      ["windowsOcrLanguage"],
      ["useOtherLanguage"],
      ["tesseractLanguage"],
      ["languageAbbreviation"],
      ["languageDataPath"],
      ["imageWidthMultiplier"],
      ["imageHeightMultiplier"],
      ["imageMatchingAlgorithm"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["locationOfTextFoundX"], ["locationOfTextFoundY"]],
  },
];

const ifTextOnScreenFieldsToWatch: string[] = ["OCREngineType"];

const ifTextOnScreen: ActivityConfig = {
  fieldList: ifTextOnScreenOCRFieldList,
  fieldCategories: ifTextOnScreenOCRFieldCategories,
  fieldsToWatch: ifTextOnScreenFieldsToWatch,
};

export default ifTextOnScreen;
