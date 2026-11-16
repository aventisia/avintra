import { RadioGroupFieldProps, SwitchFieldProps } from "@avplatform/ui/form";

// Layout Direction
const layoutDirectionProps: RadioGroupFieldProps = {
  size: "sm",
  name: "layoutDirection",
  label: "Layout direction",
  selectOptions: [
    {
      label: "Top to bottom",
      value: "TB",
    },
    {
      label: "Left to right",
      value: "LR",
    },
  ],
};

// Hide Mini Map
const miniMapProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "miniMap",
  label: "Mini map",
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
const cursorToggleProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "cursorToggle",
  label: "Select or move mode",
  description:
    "Show toggle option between Select (arrow cursor) and Move (grab hand) modes to interact with the flow",
};

// Hide Zoom Controls
const zoomControlsProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "zoomControls",
  label: "Zoom controls",
  description: "Show zoom in and zoom out buttons to adjust the flow zoom level",
};

// Enable Delete Alert
const deleteAlertProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "deleteAlert",
  label: "Delete alert",
  description: "Show a confirmation alert before deleting a node",
};

export {
  cursorToggleProps,
  deleteAlertProps,
  layoutDirectionProps,
  miniMapProps,
  undoRedoProps,
  zoomControlsProps,
};
