import { NodeDataType } from "@/types/node-data-type";

export const uiAutomationActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "getDetailsOfWindow",
    label: "Get details of window",
    description:
      "Gets a property of a window such as its title or its source text",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getDetailsOfAUiElementInWindow",
    label: "Get details of a UI element in window",
    description: "Gets the value of a UI element's attribute in a window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getSelectedCheckboxesInWindow",
    label: "Get selected checkboxes in window",
    description:
      "Retrieves the names of the selected checkboxes in a checkbox group or the state of a specific checkbox",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getSelectedRadioButtonInWindow",
    label: "Get selected radio button in window",
    description:
      "Retrieves the names of the selected radio button in a radio button group or the state of a specific radio button",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "extractDataFromWindow",
    label: "Extract data from window",
    description:
      "Extracts data from specific parts of a window in the form of single values, lists, or tables",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "extractDataFromTable",
    label: "Extract data from table",
    description: "Extracts data from a table in the form of a datatable",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "takeScreenshotOfUiElement",
    label: "Take screenshot of UI element",
    description: "Takes a screenshot of a UI element in window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "focusTextFieldInWindow",
    label: "Focus text field in window",
    description:
      "Sets the focus on a text box of a window and scrolls it into view",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "populateTextFieldInWindow",
    label: "Populate text field in window",
    description: "Fills a text box in a window with the specified text",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "pressButtonInWindow",
    label: "Press button in window",
    description: "Presses a window button",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "selectRadioButtonInWindow",
    label: "Select radio button in window",
    description: "Selects a radio button on a window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setCheckboxStateInWindow",
    label: "Set checkbox state in window",
    description: "Checks or unchecks a checkbox in a window form",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setDropDownListValueInWindow",
    label: "Set drop-down list value in window",
    description:
      "Sets or clears the selected options for a drop-down list in a window form",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getWindow",
    label: "Get window",
    description: "Gets a running window, for automating desktop applications",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "focusWindow",
    label: "Focus window",
    description: "Activates and brings to the foreground a specific window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setWindowState",
    label: "Set window state",
    description: "Restores, maximizes or minimizes a specific window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setWindowVisibility",
    label: "Set window visibility",
    description: "Shows a hidden window or hides a visible window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "moveWindow",
    label: "Move window",
    description: "Sets the position of a specific window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "resizeWindow",
    label: "Resize window",
    description: "Sets the size of a specific window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "closeWindow",
    label: "Close window",
    description: "Closes a specific window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "ifWindowContains",
    label: "If window contains",
    description:
      "Marks the beginning of a conditional block of actions depending on whether a specific piece of text or UI element exists in a window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "waitForWindowContent",
    label: "Wait for window content",
    description:
      "Suspends the execution of the automation until a specific piece of text or UI element appears or disappears from a Window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "ifImage",
    label: "If image",
    description:
      "This action marks the beginning of a conditional block of actions depending on whether a selected image is found on the screen or not",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "useDesktop",
    label: "Use desktop",
    description: "Performs desktop and taskbar related operations",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "selectTabInWindow",
    label: "Select tab in window",
    description: "Selects a tab from a group of tabs",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "waitForImage",
    label: "Wait for image",
    description:
      "This action waits until a specific image appears on the screen or on the foreground window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "hoverMouseOverUiElementInWindow",
    label: "Hover mouse over UI element in window",
    description: "Hover the mouse over any UI element on window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "clickUiElementInWindow",
    label: "Click UI element in window",
    description: "Clicks on any UI element of a window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "selectMenuOptionInWindow",
    label: "Select menu option in window",
    description: "Selects an option in a menu of a window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "dragAndDropUiElementInWindow",
    label: "Drag and drop UI element in window",
    description: "Drags and drops a UI element of a window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "expandCollapseTreeNodeInWindow",
    label: "Expand/collapse tree node in window",
    description:
      "Expands or collapses a node of a tree view residing in a window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "ifWindow",
    label: "If window",
    description:
      "This action marks the beginning of a conditional block of actions depending on whether a window is open or not or whether a window is the focused (foreground) window",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "waitForWindow",
    label: "Wait for window",
    description:
      "Suspends the execution or the process until a specific window opens, closes, get or loses the focus",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
];
