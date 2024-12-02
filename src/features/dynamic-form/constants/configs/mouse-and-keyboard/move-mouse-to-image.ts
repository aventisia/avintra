import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const moveMouseToImageFieldList: IDynamicFieldSchema[] = [
  //unique input type
  // {
  //   name: "imageToMoveMouseTo",
  //   type: "text",
  //   label: "Image to move mouse to",
  //   description: "The list of Images to move the mouse to",
  //   defaultValue: [],
  // },
  {
    name: "mouseMovementStyle",
    type: "select",
    label: "Mouse movement style",
    description:
      "Specify the style of movement in which the mouse will move from its previous position to the beginning of the recorded route (or to its final position)",
    selectOptions: [
      { label: "Instant", value: "Instant" },
      {
        label: "With animation (low speed)",
        value: "With animation (low speed)",
      },
      {
        label: "With animation (normal speed)",
        value: "With animation (normal speed)",
      },
      {
        label: "With animation (high speed)",
        value: "With animation (high speed)",
      },
    ],
    defaultValue: "Instant",
  },
  {
    name: "occurrence",
    type: "number",
    label: "Occurrence",
    description: "The occurrence of the image found to move the mouse to",
    defaultValue: 1,
  },
  {
    name: "sendClickAfterMove",
    type: "switch",
    label: "Send a click after moving mouse",
    description:
      "Specify whether to send a click after the mouse is positioned over the image",
    defaultValue: false,
  },
  {
    name: "clickType",
    type: "select",
    label: "Click type",
    description: "The mouse click to send to the image",
    selectOptions: [
      { label: "Left click", value: "Left click" },
      { label: "Right click", value: "Right click" },
      { label: "Double click", value: "Double click" },
      { label: "Middle click", value: "Middle click" },
      { label: "Left button down", value: "Left button down" },
      { label: "Left button up", value: "Left button up" },
      { label: "Right button down", value: "Right button down" },
      { label: "Right button up", value: "Right button up" },
    ],
    defaultValue: "Left click",
  },
  {
    name: "waitForImage",
    type: "switch",
    label: "Wait for image to appear",
    description:
      "Choose whether you want the action to wait if the image isn't found on the screen or foreground window",
    defaultValue: true,
  },
  {
    name: "failTimeout",
    type: "number",
    label: "Fail timeout",
    description: "The fail timeout in seconds",
    defaultValue: 0,
  },
  {
    name: "secondsBeforeClick",
    type: "number",
    label: "Seconds before click",
    description: "The number of seconds to wait before sending the click",
    defaultValue: 0,
  },
  {
    name: "imageMatchingAlgorithm",
    type: "select",
    label: "Image matching algorithm",
    description: "Which image algorithm to use when searching for image",
    selectOptions: [
      { label: "Basic", value: "Basic" },
      { label: "Advanced", value: "Advanced" },
    ],
    defaultValue: "Basic",
  },
  //unique input type
  // {
  //   name: "mousePositionRelativeToImage",
  //   type: "select",
  //   label: "Mouse position relative to image",
  //   description: "The section of the image the mouse will be moved to",
  //   selectOptions: [
  //     { label: "top left corner", value: "top left corner" },
  //     { label: "top center", value: "top center" },
  //     { label: "top right corner", value: "top right corner" },
  //     { label: "middle left part", value: "middle left part" },
  //     { label: "center", value: "center" },
  //     { label: "middle right part", value: "middle right part" },
  //     { label: "bottom left corner", value: "bottom left corner" },
  //     { label: "bottom center", value: "bottom center" },
  //     { label: "bottom right corner", value: "bottom right corner" },
  //   ],
  //   defaultValue: "center",
  // },
  {
    name: "offsetX",
    type: "text",
    label: "Offset X",
    description:
      "The pixels to offset the mouse from the position to the right",
    defaultValue: "0",
  },
  {
    name: "offsetY",
    type: "text",
    label: "Offset Y",
    description: "The pixels to offset the mouse from the position down",
    defaultValue: "0",
  },
  {
    name: "tolerance",
    type: "number",
    label: "Tolerance",
    description:
      "Specify how much the specified image can differ from the originally chosen image",
    defaultValue: 10,
  },
  {
    name: "searchForImageOn",
    type: "select",
    label: "Search for image on",
    description:
      "Specify whether to search for the specified Image in the foremost window only, or the entire visible screen.",
    selectOptions: [
      { label: "Entire screen", value: "Entire screen" },
      { label: "Foreground window only", value: "Foreground window only" },
    ],
    defaultValue: "Entire screen",
  },
  {
    name: "searchMode",
    type: "select",
    label: "Search mode",
    description:
      "Specify whether to scan the entire screen (or window) to find the supplied image or only a subregion of it",
    selectOptions: [
      {
        label: "Search whole screen or foreground window",
        value: "Search whole screen or foreground window",
      },
      {
        label: "Search on specified subregion of screen or foreground window",
        value: "Search on specified subregion of screen or foreground window",
      },
    ],
    defaultValue: "Search whole screen or foreground window",
  },
  {
    name: "x1",
    type: "number",
    label: "X1",
    description: "The starting X of the subregion to search in",
    defaultValue: null,
  },
  {
    name: "y1",
    type: "number",
    label: "Y1",
    description: "The starting Y of the subregion to search in",
    defaultValue: null,
  },
  {
    name: "x2",
    type: "number",
    label: "X2",
    description: "The ending X of the subregion to search in",
    defaultValue: null,
  },
  {
    name: "y2",
    type: "number",
    label: "Y2",
    description: "The ending Y of the subregion to search in",
    defaultValue: null,
  },
  {
    name: "x",
    type: "switch",
    label: "X Coordinate",
    description:
      "The X coordinate of the point where the image is found on the screen. If the image is being searched for on the foreground window, the coordinate returned is relative to the top left corner of the window.",
    defaultValue: true,
  },
  {
    name: "y",
    type: "switch",
    label: "Y Coordinate",
    description:
      "The Y coordinate of the point where the image is found on the screen. If the image is being searched for on the foreground window, the coordinate returned is relative to the top left corner of the window.",
    defaultValue: true,
  },
];
const moveMouseToImageFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [
      // ["imageToMoveMouseTo"],
      ["mouseMovementStyle"],
      ["occurrence"],
      ["sendClickAfterMove"],
      ["clickType"],

      ["x1"],
      ["y1"],
      ["x2"],
      ["y2"],
    ],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["waitForImage"],
      ["failTimeout"],
      ["secondsBeforeClick"],
      ["imageMatchingAlgorithm"],
      // ["mousePositionRelativeToImage"],
      ["offsetX"],
      ["offsetY"],
      ["tolerance"],
      ["searchForImageOn"],
      ["searchMode"],
    ],
  },
  {
    title: "Output",
    formFieldKeys: [["x"], ["y"]],
  },
];
const moveMouseToImage: ActivityConfig = {
  fieldList: moveMouseToImageFieldList,
  fieldCategories: moveMouseToImageFieldCategories,
  fieldsToWatch: [],
};

export default moveMouseToImage;
