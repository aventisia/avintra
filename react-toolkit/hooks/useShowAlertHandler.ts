import { useAlertDialogStore } from "@aventisia/ui/stores";
import { useShallow } from "zustand/react/shallow";

interface DefaultOptions {
  confirmActionFn: () => void;
  alertType: "delete" | "delete-record" | "delete-multiple" | "disable-multiple" | "unsaved";

  /**
   * Additional text to be displayed in the alert dialog.
   * This is used to display the name of the record or item being deleted.
   * 
   * @example for alertType "delete-record" title will be "Delete {additionalText}?".
   * and description will be "This action cannot be undone. Are you sure you want to delete this {additionalText}?"
   * @example for alertType "delete-multiple" title will be "Delete {additionalText}?".
   * and description will be "This action cannot be undone. Do you want to permanently delete the selected {additionalText?.slice(additionalText.indexOf(" ") + 1)}?"
   * @example for alertType "disable-multiple" title will be "Disable {additionalText}?".
   * and description will be "Do you want to disable the selected {additionalText?.slice(additionalText.indexOf(" ") + 1)}?"
   */
  additionalText?: string;
}

interface CustomOptions {
  confirmActionFn: () => void;
  isDestructive?: boolean;
  title?: string;
  description?: string;
  cancelBtnText?: string;
  confirmBtnText?: string;
}

// Get alert dialog options based on alert type
const getOptionsBasedOnAlertType = ({
  alertType,
  additionalText,
}: DefaultOptions) =>
  ({
    delete: {
      isDestructive: true,
      title: "Delete?",
      description:
        "This action cannot be undone. Are you sure you want to delete?",
      confirmBtnText: "Yes, delete",
    },
    "delete-record": {
      isDestructive: true,
      title: `Delete ${additionalText}?`,
      description: `This action cannot be undone. Are you sure you want to delete this ${additionalText}?`,
      confirmBtnText: `Yes, delete ${additionalText}`,
    },
    "delete-multiple": {
      isDestructive: true,
      title: `Delete ${additionalText}?`,
      description: `This action cannot be undone. Do you want to permanently delete the selected ${additionalText?.slice(additionalText.indexOf(" ") + 1)}?`,
      confirmBtnText: "Yes, delete",
    },
    "disable-multiple": {
      isDestructive: false,
      title: `Disable ${additionalText}?`,
      description: `Do you want to disable the selected ${additionalText?.slice(additionalText.indexOf(" ") + 1)}?`,
      confirmBtnText: "Yes, disable",
    },
    unsaved: {
      isDestructive: true,
      title: "Discard changes?",
      description:
        "You have unsaved changes. Are you sure you want to leave and discard them?",
      confirmBtnText: "Yes, discard changes",
    },
  })[alertType];

/**
 * Custom hook that provides a handler to show alert dialog and set other props.
 *
 * @param confirmActionFn - The function to be called when the continue/confirm action is confirmed.
 * @param isDestructive - A boolean value to determine if the action is destructive.
 * @param title - The title text to be displayed in the alert dialog.
 * @param description - The description text to be displayed in the alert dialog.
 * @param cancelBtnText - The text to be displayed on the cancel button in the alert dialog.
 * @param confirmBtnText - The text to be displayed on the continue/confirm button in the alert dialog.
 * @returns An object containing the `showAlertDialogHandler` function.
 */
export const useShowAlertHandler = () => {
  // Get alert dialog store action
  const { setAlertDialogState } = useAlertDialogStore(
    useShallow((state) => ({
      setAlertDialogState: state.setAlertDialogState,
    })),
  );

  // Show alert dialog with default options
  const showDefaultAlertDialog = (defaultOptions: DefaultOptions) => {
    // Set alert dialog state
    setAlertDialogState({
      isAlertDialogOpen: true,
      confirmActionFn: defaultOptions.confirmActionFn,
      ...getOptionsBasedOnAlertType(defaultOptions),
    });
  };

  // Show alert dialog to confirm action
  const showCustomAlertDialog = (customOptions: CustomOptions) => {
    // Set alert dialog state
    setAlertDialogState({
      isAlertDialogOpen: true,
      ...customOptions,
    });
  };

  return {
    showDefaultAlertDialog,
    showCustomAlertDialog,
  };
};
