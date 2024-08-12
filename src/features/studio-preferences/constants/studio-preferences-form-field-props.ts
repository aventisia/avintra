import { SelectFieldProps } from "@/react-toolkit/ui/form/fields/SelectField";
import { SwitchFieldProps } from "@/react-toolkit/ui/form/fields/SwitchField";

// Layout Direction
const layoutDirectionProps: SelectFieldProps = {
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

// Enable Auto Arrange
const enableAutoArrangeProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "enableAutoArrange",
  label: "Enable Auto Arrange",
  description:
    "Enable auto arrange to automatically arrange the flow",
};

// Show Mini Map
const showMiniMapProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "showMiniMap",
  label: "Show Mini Map",
  description: "Show a mini map to navigate the flow",
};

// Show Undo/Redo
const showUndoRedoProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "showUndoRedo",
  label: "Show Undo/Redo",
  description: "Show undo/redo buttons to navigate the flow history",
};

// Show Intractivity Toggle
const showIntractivityToggleProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "showIntractivityToggle",
  label: "Show Intractivity Toggle",
  description: "Show a toggle to enable/disable intractivity of the flow",
};

// Show Zoom Controls
const showZoomControlsProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "showZoomControls",
  label: "Show Zoom Controls",
  description: "Show zoom controls to zoom in and out of the flow",
};

// Enable Delete Alert
const enableDeleteAlertProps: SwitchFieldProps = {
  size: "sm",
  showBorder: false,
  name: "enableDeleteAlert",
  label: "Enable Delete Alert",
  description: "Show a confirmation alert before deleting a node",
};

export {
  layoutDirectionProps,
  enableAutoArrangeProps,
  showMiniMapProps,
  showUndoRedoProps,
  showIntractivityToggleProps,
  showZoomControlsProps,
  enableDeleteAlertProps,
};
