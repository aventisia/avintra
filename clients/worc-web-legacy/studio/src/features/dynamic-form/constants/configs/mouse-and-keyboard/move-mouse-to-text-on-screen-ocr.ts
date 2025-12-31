import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const moveMouseToTextOnScreenOcrFieldList: IDynamicFieldSchema[] = [
  {
    name: "ocrEngineType",
    type: "select",
    label: "OCR engine type",
    description:
      "The OCR engine type to use. Select a preconfigured OCR engine or set up a new one.",
    selectOptions: [
      { label: "Tesseract engine", value: "tesseract" },
      { label: "Custom engine", value: "custom" },
    ],
    defaultValue: "tesseract",
  },
  {
    name: "ocrEngineVariable",
    type: "text",
    label: "OCR engine variable",
    description: "The OCR engine to search for the text with",
    defaultValue: "",
  },
  {
    name: "textToFind",
    type: "text",
    label: "Text to find",
    description: "The text to move the mouse over",
    defaultValue: "",
  },
  {
    name: "isRegularExpression",
    type: "checkbox",
    label: "Is regular expression",
    description:
      "Whether to use a regular expression to look for the text on screen",
    defaultValue: false,
  },
  {
    name: "occurrence",
    type: "number",
    label: "Occurrence",
    description:
      "A positive number that will be used as the occurrence of the input text on screen",
    defaultValue: 1,
  },
  {
    name: "searchForTextOn",
    type: "select",
    label: "Search for text on",
    description:
      "Whether to look for the specified text in the foremost window only or the entire visible screen.",
    selectOptions: [
      { label: "Entire screen", value: "entireScreen" },
      { label: "Foreground window only", value: "foregroundWindow" },
    ],
    defaultValue: "entireScreen",
  },
  {
    name: "searchMode",
    type: "select",
    label: "Search mode",
    description:
      "Whether to scan the entire screen (or window) to find the supplied text or only a narrow subregion of it",
    selectOptions: [
      { label: "Whole of specified source", value: "wholeSource" },
      { label: "Specific subregion only", value: "subregionOnly" },
      { label: "Subregion relative to image", value: "subregionRelative" },
    ],
    defaultValue: "wholeSource",
  },
  {
    name: "x1",
    type: "number",
    label: "X1",
    description:
      "The start X coordinate of the subregion to scan for the supplied text",
    defaultValue: 0,
  },
  {
    name: "y1",
    type: "number",
    label: "Y1",
    description:
      "The start Y coordinate of the subregion to scan for the supplied text",
    defaultValue: 0,
  },
  {
    name: "x2",
    type: "number",
    label: "X2",
    description:
      "The end X coordinate of the subregion to scan for the supplied text",
    defaultValue: 0,
  },
  {
    name: "y2",
    type: "number",
    label: "Y2",
    description:
      "The end Y coordinate of the subregion to scan for the supplied text",
    defaultValue: 0,
  },
  {
    name: "images",
    type: "text",
    label: "Image(s)",
    description:
      "The image(s) specifying the subregion (relative to the top left corner of the image) to scan for the supplied text",
    defaultValue: "",
  },
  {
    name: "moveMouseFromPreviousPosition",
    type: "select",
    label: "Move mouse from previous position",
    description:
      "The style of movement in which the mouse will move from its previous position to its final position",
    selectOptions: [
      { label: "Instant", value: "instant" },
      { label: "With animation (low speed)", value: "lowSpeed" },
      { label: "With animation (normal speed)", value: "normalSpeed" },
      { label: "With animation (high speed)", value: "highSpeed" },
    ],
    defaultValue: "instant",
  },
  {
    name: "windowsOcrLanguage",
    type: "select",
    label: "Windows OCR language",
    description: "The language of the text that the Windows OCR engine detects",
    selectOptions: [
      { label: "Chinese (Simplified)", value: "chineseSimplified" },
      { label: "Chinese (Traditional)", value: "chineseTraditional" },
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
      { label: "Serbian (Cyrillic)", value: "serbianCyrillic" },
      { label: "Serbian (Latin)", value: "serbianLatin" },
      { label: "Slovak", value: "slovak" },
      { label: "Spanish", value: "spanish" },
      { label: "Swedish", value: "swedish" },
      { label: "Turkish", value: "turkish" },
    ],
    defaultValue: "english",
  },
  {
    name: "tesseractLanguage",
    type: "select",
    label: "Tesseract language",
    description: "The language of the text that the Tesseract engine detects",
    selectOptions: [
      { label: "English", value: "eng" },
      { label: "German", value: "deu" },
      { label: "Spanish", value: "spa" },
    ],
    defaultValue: "eng",
  },
  {
    name: "imageWidthMultiplier",
    type: "number",
    label: "Image width multiplier",
    description: "The width multiplier of the image",
    defaultValue: 1,
  },
  {
    name: "imageHeightMultiplier",
    type: "number",
    label: "Image height multiplier",
    description: "The height multiplier of the image",
    defaultValue: 1,
  },
  {
    name: "waitForTextToAppear",
    type: "checkbox",
    label: "Wait for text to appear",
    description:
      "Specify whether to wait if the text isn't found on the screen or foreground window",
    defaultValue: false,
  },
  {
    name: "failIfTextDoesNotAppearWithin",
    type: "number",
    label: "Fail if text doesn't appear within",
    description:
      "The number of seconds to wait for the supplied text to appear",
    defaultValue: 10,
  },
  {
    name: "sendClickAfterMovingMouse",
    type: "checkbox",
    label: "Send a click after moving mouse",
    description:
      "Specify whether to send a click after the mouse is positioned over the text",
    defaultValue: false,
  },
  {
    name: "clickType",
    type: "select",
    label: "Click type",
    description: "The mouse click type to send to the text",
    selectOptions: [
      { label: "Left click", value: "leftClick" },
      { label: "Right click", value: "rightClick" },
      { label: "Double click", value: "doubleClick" },
    ],
    defaultValue: "leftClick",
  },
  {
    name: "waitBeforeClickingFor",
    type: "number",
    label: "Wait before clicking for",
    description: "The number of seconds to wait before clicking",
    defaultValue: 1,
  },
  // unique input type
  // {
  //   name: "mousePositionRelativeToText",
  //   type: "select",
  //   label: "Mouse position relative to text",
  //   description: "Specify which section of the text the mouse will be moved to",
  //   selectOptions: [
  // { label: "Top left", value: "topLeft" },
  // { label: "Top center", value: "topCenter" },
  // { label: "Top right", value: "topRight" },
  // { label: "Middle left", value: "middleLeft" },
  // { label: "Middle center", value: "middleCenter" },
  // { label: "Middle right", value: "middleRight" },
  // { label: "Bottom left", value: "bottomLeft" },
  // { label: "Bottom center", value: "bottomCenter" },
  // { label: "Bottom right", value: "bottomRight" }
  //   ],
  //   defaultValue: "middleCenter",
  // },
  {
    name: "offsetX",
    type: "number",
    label: "Offset X",
    description:
      "Offset the mouse from the position by this many pixels to the right",
    defaultValue: 0,
  },
  {
    name: "offsetY",
    type: "number",
    label: "Offset Y",
    description: "Offset the mouse from the position by this many pixels down",
    defaultValue: 0,
  },
  {
    name: "locationOfTextFoundX",
    type: "switch",
    label: "Text Found X Coordinate",
    description:
      "The X coordinate of the point where the text is found on the screen. If the text is searched for in the foreground window, this coordinate is relative to the top left corner of the window.",
    defaultValue: true,
  },
  {
    name: "locationOfTextFoundY",
    type: "switch",
    label: "Text Found Y Coordinate",
    description:
      "The Y coordinate of the point where the text is found on the screen. If the text is searched for in the foreground window, this coordinate is relative to the top left corner of the window.",
    defaultValue: true,
  },
  {
    name: "widthOfTextFound",
    type: "switch",
    label: "Text Found Width",
    description: "The width of the area where the text was found.",
    defaultValue: true,
  },
  {
    name: "heightOfTextFound",
    type: "switch",
    label: "Text Found Height",
    description: "The height of the area where the text was found.",
    defaultValue: true,
  },
];

const moveMouseToTextOnScreenOcrFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      ["ocrEngineType"],
      ["ocrEngineVariable"],
      ["textToFind"],
      ["isRegularExpression"],
      ["occurrence"],
      ["searchForTextOn"],
      ["searchMode"],
      ["x1"],
      ["y1"],
      ["x2"],
      ["y2"],
      ["images"],
      ["moveMouseFromPreviousPosition"],
    ],
  },
  {
    title: "OCR Engine Settings",
    formFieldKeys: [
      ["windowsOcrLanguage"],
      ["tesseractLanguage"],
      ["imageWidthMultiplier"],
      ["imageHeightMultiplier"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["waitForTextToAppear"],
      ["failIfTextDoesNotAppearWithin"],
      ["sendClickAfterMovingMouse"],
      ["clickType"],
      ["waitBeforeClickingFor"],
      // ["mousePositionRelativeToText"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [
      ["locationOfTextFoundX"],
      ["locationOfTextFoundY"],
      ["widthOfTextFound"],
      ["heightOfTextFound"],
    ],
  },
];
const moveMouseToTextOnScreenOcr: ActivityConfig = {
  fieldList: moveMouseToTextOnScreenOcrFieldList,
  fieldCategories: moveMouseToTextOnScreenOcrFieldCategories,
  fieldsToWatch: [],
};

export default moveMouseToTextOnScreenOcr;
