import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const waitForTextOnScreenFieldList: IDynamicFieldSchema[] = [
  {
    name: "waitForTextTo",
    type: "select",
    label: "Wait for text to",
    description:
      "Specifies whether to wait for the text to appear or disappear",
    selectOptions: [
      { label: "Appear", value: "appear" },
      { label: "Disappear", value: "disappear" },
    ],
    defaultValue: "appear",
  },
  {
    name: "oCREngineType",
    type: "select",
    label: "OCR engine type",
    description:
      "The OCR engine type to use. Select a preconfigured OCR engine or set up a new one.",
    selectOptions: [
      { label: "Windows OCR engine", value: "windows OCR engine" },
      { label: "Tesseract engine", value: "tesseract engine" },
      { label: "OCR engine variable", value: "oCR engine variable" },
    ],
    defaultValue: "oCR engine variable",
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
      "The start X coordinate of the subregion to scan for the supplied text",
    defaultValue: "",
  },
  {
    name: "tolerance",
    type: "number",
    label: "Tolerance",
    description:
      "Specifies how much the image(s) searched for can differ from the originally chosen image",
    defaultValue: "10",
  },
  {
    name: "y1",
    type: "number",
    label: "Y1",
    description:
      "	The start Y coordinate of the subregion to scan for the supplied text",
    defaultValue: "",
  },
  {
    name: "x1",
    type: "number",
    label: "X1",
    description:
      "	The start X coordinate of the subregion relative to the specified image to scan for the supplied text",
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
      "The end Y coordinate of the subregion to scan for the supplied text",
    defaultValue: "",
  },
  {
    name: "x2",
    type: "number",
    label: "X2",
    description:
      "The end X coordinate of the subregion relative to the specified image to scan for the supplied text",
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
      { label: "Chinese (Simplified)", value: "chinese_simplified" },
      { label: "Chinese (Traditional)", value: "chinese_traditional" },
      { label: "Czech", value: "czech" },
      { label: "Danish", value: "danish" },
      { label: "Dutch", value: "dutch" },
      { label: "English", value: "english" },
      { label: "Finnish", value: "finnish" },
      { label: "French", value: "french" },
      { label: "German", value: "german" },
      { label: "Greek", value: "greek" },
      { label: "Hungarian", value: "hungarian" },
      { label: "Italian", value: "italian" },
      { label: "Japanese", value: "japanese" },
      { label: "Korean", value: "korean" },
      { label: "Norwegian", value: "norwegian" },
      { label: "Polish", value: "polish" },
      { label: "Portuguese", value: "portuguese" },
      { label: "Romanian", value: "romanian" },
      { label: "Russian", value: "russian" },
      { label: "Serbian (Cyrillic)", value: "serbian_cyrillic" },
      { label: "Serbian (Latin)", value: "serbian_latin" },
      { label: "Slovak", value: "slovak" },
      { label: "Spanish", value: "spanish" },
      { label: "Swedish", value: "swedish" },
      { label: "Turkish", value: "turkish" },
    ],

    defaultValue: "english",
  },
  {
    name: "useOtherLanguage",
    type: "switch",
    label: "Use other language",
    description:
      "Specifies whether to use a language not given in the 'Tesseract language' field",
    defaultValue: false,
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
    defaultValue: "1",
  },
  {
    name: "imageHeightMultiplier",
    type: "number",
    label: "Image height multiplier",
    description: "The height multiplier of the image",
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
  {
    name: "failWithTimeOutError",
    type: "switch",
    label: "Fail with timeout error",
    description:
      "Specify whether you want the action to wait indefinitely or fail after a set time period",
    defaultValue: false,
  },
  // Output
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

const waitForTextOnScreenFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["waitForTextTo"],
      ["oCREngineType"],
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
      ["failWithTimeOutError"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["locationOfTextFoundX"], ["locationOfTextFoundY"]],
  },
];
const waitForTextOnScreen: ActivityConfig = {
  fieldList: waitForTextOnScreenFieldList,
  fieldCategories: waitForTextOnScreenFieldCategories,
  fieldsToWatch: [],
};

export default waitForTextOnScreen;
