import { NodeDataType } from "@/types/node-data-type";

export const mouseAndKeyboardActions: NodeDataType[] = [
  {
    type: "activityNode",
    name: "blockInput",
    label: "Block Input",
    description:
      "Blocks user mouse and keyboard input, so that the flow can perform mouse and keyboard actions without interference from the user.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getMousePosition",
    label: "Get mouse position",
    description:
      "Retrieves the current position of the mouse cursor on the screen in pixel coordinates.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "moveMouse",
    label: "Move mouse",
    description: "Moves the mouse to a specific position.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  // To be implemented later
  // {
  //   type: "activityNode",
  //   name: "moveMouseToImage",
  //   label: "Move mouse to image",
  //   description:
  //     "Moves the mouse over an image found on screen or on the foreground window.",
  //   img: `${import.meta.env.BASE_URL}function.png`,
  // },

  // To be implemented later
  // {
  //   type: "activityNode",
  //   name: "moveMouseToTextOnScreen(ocr)",
  //   label: "Move mouse to text on screen (OCR)",
  //   description:
  //     "Moves the mouse over a text found on the screen or on the foreground window using OCR.",
  //   img: `${import.meta.env.BASE_URL}function.png`,
  // },
  // {
  //   type: "activityNode",
  //   name: "sendMouseClick",
  //   label: "Send mouse click",
  //   description: "Sends a mouse click event.",
  //   img: `${import.meta.env.BASE_URL}function.png`,
  // },
  
  // to be done later
  // {
  //   type: "activityNode",
  //   name: "sendKeys",
  //   label: "Send keys",
  //   description: "Sends keys to the application that is currently active.",
  //   img: `${import.meta.env.BASE_URL}function.png`,
  // },
  {
    type: "activityNode",
    name: "pressreleaseKey",
    label: "Press/release key",
    description:
      "Presses (and holds) or releases one or more modifier keys (Alt, Control, or Shift).",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "setKeyState",
    label: "Set key state",
    description:
      "Sets the state (on or off) for the keys Caps Lock, Num Lock or Scroll Lock",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "waitForMouse",
    label: "Wait for mouse",
    description:
      "Suspends the execution of the flow until the mouse pointer changes, usually to or from the 'wait cursor' or hourglass.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  {
    type: "activityNode",
    name: "getKeyboardIdentifier",
    label: "Get keyboard identifier",
    description:
      "Retrieves the active keyboard identifier from the machine's registry.",
    img: `${import.meta.env.BASE_URL}function.png`,
  },
  // to be done later
  // {
  //   type: "activityNode",
  //   name: "waitForShortcutKey",
  //   label: "Wait for shortcut key",
  //   description:
  //     "Pause the flow run until a specific shortcut key is pressed. Shortcut keys must contain at least one key or a key and one of (ctrl, alt, shift). Multiple shortcut keys can be defined.",
  //   img: `${import.meta.env.BASE_URL}function.png`,
  // },
];
