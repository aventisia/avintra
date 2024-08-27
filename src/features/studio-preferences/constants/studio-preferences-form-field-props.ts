import { RadioGroupFieldProps } from "@/react-toolkit/ui/form/fields/RadioGroupField";
import { SwitchFieldProps } from "@/react-toolkit/ui/form/fields/SwitchField";

// Layout Direction
const layoutDirectionProps: RadioGroupFieldProps = {
  size: "sm",
  name: "layoutDirection",
  label: "Layout Direction",
  selectOptions: [
    {
      label: "Top to Bottom",
      value: "TB",
    },
    {
      label: "Left to Right",
      value: "LR",
    },
  ],
};

// Hide Mini Map
const miniMapProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "miniMap",
  label: "Mini Map",
  description: "Show a mini map to navigate the flow",
};

// Hide Undo/Redo
const undoRedoProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "undoRedo",
  label: "Undo/Redo",
  description: "Show undo and redo buttons to revert changes in the flow",
};

// Hide Intractivity Toggle
const intractivityToggleProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "intractivityToggle",
  label: "Intractivity Toggle",
  description: "Show a toggle button to enable or disable intractivity in the flow",
};

// Hide Zoom Controls
const zoomControlsProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "zoomControls",
  label: "Zoom Controls",
  description: "Show zoom in and zoom out buttons to adjust the flow zoom level",
};

// Enable Delete Alert
const deleteAlertProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "deleteAlert",
  label: "Delete Alert",
  description: "Show a confirmation alert before deleting a node",
};

export {
  layoutDirectionProps,
  miniMapProps,
  undoRedoProps,
  intractivityToggleProps,
  zoomControlsProps,
  deleteAlertProps,
};
