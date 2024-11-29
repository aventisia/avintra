import {
  IDynamicFieldSchema,
  IDynamicFormKeysCategory,
  ActivityConfig,
} from "../../..";

const waitForMouseFieldList: IDynamicFieldSchema[] = [
  {
    name: "waitForMousePointerTo",
    type: "select",
    label: "Wait for mouse pointer to",
    description: "Choose what action of the mouse cursor to wait for.",
    selectOptions: [
      { label: "Become", value: "Become" },
      { label: "Become not", value: "Become not" },
    ],
    defaultValue: "Become",
  },
  {
    name: "mousePointer",
    type: "select",
    label: "Mouse pointer",
    description: "Specify the mouse pointer state.",
    selectOptions: [
      { label: "Arrow", value: "Arrow" },
      { label: "App starting", value: "App starting" },
      { label: "Cross", value: "Cross" },
      { label: "Hand", value: "Hand" },
      { label: "Help", value: "Help" },
      { label: "IBeam", value: "IBeam" },
      { label: "Wait cursor", value: "Wait cursor" },
    ],
    defaultValue: "Arrow",
  },
  // In ui There is an switch input to select on or off, but in more info it's data is not there
];

const waitForMouseFieldCategories: IDynamicFormKeysCategory[] = [
  {
    title: "Basic",
    formFieldKeys: [["waitForMousePointerTo"], ["mousePointer"]],
  },
  {
    title: "Output",
    formFieldKeys: [[""], [""]],
  },
];
const waitForMouse: ActivityConfig = {
  fieldList: waitForMouseFieldList,
  fieldCategories: waitForMouseFieldCategories,
  fieldsToWatch: [],
};

export default waitForMouse;
