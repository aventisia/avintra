import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const dragDropUiELementInWindowFieldList: IDynamicFieldSchema[] = [
  {
    name: "uiElementToDrag",
    type: "ui-element-selector",
    label: "UI element to drag",
    description: "The Ul element to drag",
    defaultValue: "",
  },
  {
    name: "uiElementToDrop",
    type: "ui-element-selector",
    label: "UI element to drop over",
    description: "The Ul element to drop over",
    defaultValue: "",
  },
  {
    name: "clickType",
    type: "select",
    label: "Click type",
    description:
      "Specify which mouse button to use for clicking and holding down, while dragging the Ul element over to its destination",
    selectOptions: [
      { label: "Left click", value: "left click" },
      { label: "Right click", value: "right click" },
    ],
    defaultValue: "left click",
  },
  {
    name: "mousePositionDrag",
    type: "select",
    label: "Mouse position relative to drag-target UI element",
    description:
      "Specify which section of the Ul element to drop the mouse onto prior to clicking",
    selectOptions: [
      { label: "Top left", value: "Top left" },
      { label: "Middle left", value: "Middle left" },
      { label: "Bottom left", value: "Bottom left" },
      { label: "Top center", value: "Top center" },
      { label: "Middle center", value: "Middle center" },
      { label: "Bottom center", value: "Bottom center" },
      { label: "Top right", value: "Top right" },
      { label: "Middle right", value: "Middle right" },
      { label: "Bottom right", value: "Bottom right" },
    ],
    defaultValue: "Middle center",
  },
  {
    name: "offsetXDrag",
    type: "number",
    label: "Offset X",
    description:
      "Offset the mouse-down click, that will be used to grab the Ul element to drag, by this many pixels to the right",
    defaultValue: 0,
  },
  {
    name: "offsetYDrag",
    type: "number",
    label: "Offset Y",
    description:
      "Offset the mouse-down click, that will be used to grab the Ul element to Drop, by this many pixels downwards",
    defaultValue: 0,
  },
  {
    name: "mousePositionDrop",
    type: "select",
    label: "Mouse position relative to drop-target UI element",
    description:
      "Specify which section of the Ul element to drag the mouse onto after to clicking",
    selectOptions: [
      { label: "Top left", value: "Top left" },
      { label: "Middle left", value: "Middle left" },
      { label: "Bottom left", value: "Bottom left" },
      { label: "Top center", value: "Top center" },
      { label: "Middle center", value: "Middle center" },
      { label: "Bottom center", value: "Bottom center" },
      { label: "Top right", value: "Top right" },
      { label: "Middle right", value: "Middle right" },
      { label: "Bottom right", value: "Bottom right" },
    ],
    defaultValue: "Middle center",
  },
  {
    name: "offsetXDrop",
    type: "number",
    label: "Offset X",
    description:
      "Offset the mouse-up click, that will be used to grab the Ul element to drag, by this many pixels to the right",
    defaultValue: 0,
  },
  {
    name: "offsetYDrop",
    type: "number",
    label: "Offset Y",
    description:
      "Offset the mouse-up click, that will be used to grab the Ul element to drag, by this many pixels downwards",
    defaultValue: 0,
  },
];

const dragDropUiELementInWindowFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["uiElementToDrag"], ["uiElementToDrop"]],
  },
  {
    title: "Advanced",
    formFieldKeys: [
      ["clickType"],
      ["mousePositionDrag"],
      ["offsetXDrag","offsetYDrag"],
      ["mousePositionDrop"],
      ["offsetXDrop","offsetYDrop"],
    ],
  },
];

const dragDropUiELementInWindowFieldsToWatch: string[] = [];

const dragDropUiELementInWindow: ActivityConfig = {
  fieldList: dragDropUiELementInWindowFieldList,
  fieldCategories: dragDropUiELementInWindowFieldCategories,
  fieldsToWatch: dragDropUiELementInWindowFieldsToWatch,
};

export default dragDropUiELementInWindow;
