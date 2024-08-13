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
const hideMiniMapProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "hideMiniMap",
  label: "Hide Mini Map",
  description: "Hides the mini map to navigate the flow",
};

// Hide Undo/Redo
const hideUndoRedoProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "hideUndoRedo",
  label: "Hide Undo/Redo",
  description: "Hides undo/redo buttons to navigate the flow history",
};

// Hide Intractivity Toggle
const hideIntractivityToggleProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "hideIntractivityToggle",
  label: "Hide Intractivity Toggle",
  description: "Hides a toggle to enable/disable intractivity of the flow",
};

// Hide Zoom Controls
const hideZoomControlsProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "hideZoomControls",
  label: "Hide Zoom Controls",
  description: "Hides zoom controls to zoom in and out of the flow",
};

// Enable Delete Alert
const disableDeleteAlertProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "disableDeleteAlert",
  label: "Disable Delete Alert",
  description: "Disables the confirmation alert dialog before deleting a node",
};

export {
  layoutDirectionProps,
  hideMiniMapProps,
  hideUndoRedoProps,
  hideIntractivityToggleProps,
  hideZoomControlsProps,
  disableDeleteAlertProps,
};
