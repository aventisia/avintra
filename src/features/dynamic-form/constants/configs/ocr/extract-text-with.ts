import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const extractTextWithOcrFieldList: IDynamicFieldSchema[] = [
  {
    name: "OcrEngine",
    type: "select",
    label: "OCR engine",
    description:
      "The OCR engine type to use. Select a preconfigured OCR engine or set up a new one",
    selectOptions: [
      { label: "Windows OCR engine", value: "windows OCR engine" },
      { label: "Tesseract engine", value: "tesseract engine" },
      { label: "OCR engine variable", value: "oCR engine variable" },
    ],
    defaultValue: "oCR engine variable",
  },
  {
    name: "ocrEngineVariable",
    type: "text",
    label: "OCR engine variable",
    description: "The engine to use for the OCR operation",
    defaultValue: "",
  },
  {
    name: "ocrSource",
    type: "select",
    label: "OCR source",
    description: "The source of the image to perform the OCR operation on",
    selectOptions: [
      { label: "Screen", value: "screen" },
      { label: "Foreground window ", value: "Foreground window" },
      { label: "Image on disk", value: "Image on disk" },
    ],
    defaultValue: "screen",
  },
  {
    name: "imageFilePath",
    type: "text",
    label: "Image file path",
    description: "The path of the image to perform the OCR operation on",
    defaultValue: "",
  },
  {
    name: "searchMode",
    type: "select",
    label: "Search mode",
    description: "The selected mode for the OCR operation",
    selectOptions: [
      {
        label: "Whole of specified source",
        value: "whole of specified source",
      },
      { label: "Specific subregion only", value: "specific subregion only" },
      {
        label: "Subregion relative to image",
        value: "Subregion relative to image",
      },
    ],
    defaultValue: "whole of specified source",
  },
  {
    name: "image",
    type: "text",
    label: "Image",
    description:
      "The image to use for narrowing down the scan to a subregion that is relative to the specified image",
    defaultValue: "",
  },
  {
    name: "tolerance",
    type: "text",
    label: "Tolerance",
    description:
      "	Specifies how much the image can differ from the originally chosen image",
    defaultValue: "10",
  },
  {
    name: "x1",
    type: "text",
    label: "X1",
    description:
      "The start X coordinate of the subregion to narrow down the scan",
    defaultValue: "",
  },
  {
    name: "x2",
    type: "text",
    label: "X2",
    description:
      "The end X coordinate of the subregion to narrow down the scan",
    defaultValue: "",
  },
  {
    name: "y1",
    type: "text",
    label: "Y1",
    description:
      "The start Y coordinate of the subregion to narrow down the scan",
    defaultValue: "",
  },
  {
    name: "y2",
    type: "text",
    label: "Y2",
    description:
      "The end Y coordinate of the subregion to narrow down the scan",
    defaultValue: "",
  },

  {
    name: "Windows OCR language",
    type: "select",
    label: "Windows OCR language",
    description: "The language of the text that the Windows OCR engine detects",
    selectOptions: [
      { label: "Chinese (Simplified)", value: "zh-CN" },
      { label: "Chinese (Traditional)", value: "zh-TW" },
      { label: "Czech", value: "cs" },
      { label: "Danish", value: "da" },
      { label: "Dutch", value: "nl" },
      { label: "English", value: "en" },
      { label: "Finnish", value: "fi" },
      { label: "French", value: "fr" },
      { label: "German", value: "de" },
      { label: "Greek", value: "el" },
      { label: "Hungarian", value: "hu" },
      { label: "Italian", value: "it" },
      { label: "Japanese", value: "ja" },
      { label: "Korean", value: "ko" },
      { label: "Norwegian", value: "no" },
      { label: "Polish", value: "pl" },
      { label: "Portuguese", value: "pt" },
      { label: "Romanian", value: "ro" },
      { label: "Russian", value: "ru" },
      { label: "Serbian (Cyrillic)", value: "sr-Cyrl" },
      { label: "Serbian (Latin)", value: "sr-Latn" },
      { label: "Slovak", value: "sk" },
      { label: "Spanish", value: "es" },
      { label: "Swedish", value: "sv" },
      { label: "Turkish", value: "tr" },
    ],

    defaultValue: "en",
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
      { label: "English", value: "en" },
      { label: "German", value: "de" },
      { label: "Spanish", value: "es" },
      { label: "French", value: "fr" },
      { label: "Italian", value: "it" },
    ],
    defaultValue: "en",
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
    type: "text",
    label: "Image width multiplier",
    description: "The width multiplier of the image",
    defaultValue: "1",
  },
  {
    name: "imageHeightMultiplier",
    type: "text",
    label: "Image height multiplier",
    description: "The height multiplier of the image",
    defaultValue: "1",
  },
  {
    name: "waitForImageToAppear",
    type: "switch",
    label: "Wait for image to appear",
    description:
      "Specifies whether to wait or not for the image to appear on the screen or foreground window",
    defaultValue: true,
  },
  {
    name: "timeOut",
    type: "text",
    label: "Timeout",
    description:
      "Specifies the time to wait for the operation to complete before the action fails",
    defaultValue: "5",
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
    name: "o_ocrTextOutput", //to watch
    type: "output-text-field",
    label: "",
    description: "The result after the text extraction",
    defaultValue: "OcrText",
    regOptions: {
      disabledBasedOnFields: {
        conditionList: [
          {
            fields: [{ key: "o_ocrTextSwitch", value: false }],
          },
        ],
        initialState: false,
      },
    },
  },
  {
    name: "o_ocrTextSwitch",
    type: "output-switch-field",
    label: "OcrText",
    defaultValue: true,
  },
];

const extractTextWithOcrFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["OcrEngine"],
      ["ocrEngineVariable"],
      ["ocrSource"],
      ["imageFilePath"],
      ["searchMode"],
      ["image"],
      ["tolerance"],
      ["x1"],
      ["x2"],
      ["y1"],
      ["y2"],
      ["useOtherLanguage"],
      ["tesseractLanguage"],
      ["languageAbbreviation"],
      ["languageDataPath"],
      ["imageWidthMultiplier"],
      ["imageHeightMultiplier"],
      ["waitForImageToAppear"],
      ["timeOut"],
      ["imageMatchingAlgorithm"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["o_ocrTextOutput", "o_ocrTextSwitch"]],
  },
];

const extractTextWithOcr: ActivityConfig = {
  fieldList: extractTextWithOcrFieldList,
  fieldCategories: extractTextWithOcrFieldCategories,
  fieldsToWatch: ["o_ocrTextOutput", "o_ocrTextSwitch"],
};

export default extractTextWithOcr;
