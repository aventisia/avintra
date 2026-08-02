/**
 * Represents the default options for configuring an alert dialog.
 *
 * @property confirmActionFn - A callback function to be executed when the confirm action is triggered.
 * @property alertType - Specifies the type of alert dialog. Possible values include:
 * - `"delete"`: A generic delete confirmation dialog.
 * - `"delete-record"`: A dialog for confirming the deletion of a specific record.
 * - `"delete-multiple"`: A dialog for confirming the deletion of multiple items.
 * - `"disable-multiple"`: A dialog for confirming the disabling of multiple items.
 * - `"unsaved"`: A dialog for warning about unsaved changes.
 * @property additionalText - Optional. Additional text to be displayed in the alert dialog. This is typically used
 * to provide context, such as the name of the record or item being acted upon.
 *
 * @example
 * For `alertType: "delete-record"`:
 * - Title: "Delete {additionalText}?"
 * - Description: "This action cannot be undone. Are you sure you want to delete this {additionalText}?"
 *
 * @example
 * For `alertType: "delete-multiple"`:
 * - Title: "Delete {additionalText}?"
 * - Description: "This action cannot be undone. Do you want to permanently delete the selected {additionalText?.slice(additionalText.indexOf(' ') + 1)}?"
 *
 * @example
 * For `alertType: "disable-multiple"`:
 * - Title: "Disable {additionalText}?"
 * - Description: "Do you want to disable the selected {additionalText?.slice(additionalText.indexOf(' ') + 1)}?"
 */
type AlertDialogDefaultOptions = {
  /** Function to be executed when the confirm action is triggered */
  confirmActionFn: () => void;

  /** Type of alert dialog */
  alertType: "delete" | "delete-record" | "delete-multiple" | "disable-multiple" | "unsaved";

  /** Additional text to be displayed in the alert dialog. This is typically used
   * to provide context, such as the name of the record or item being acted upon.
   * Not applicable for `delete` and `unsaved` alert types.
   */
  additionalText?: string;
};

/**
 * Represents the custom options for configuring an alert dialog.
 *
 * @property confirmActionFn - A function to be executed when the confirm button is clicked.
 * @property isDestructive - (Optional) Indicates whether the action is destructive. Defaults to `false`.
 * @property title - (Optional) The title of the alert dialog.
 * @property description - (Optional) A brief description or message displayed in the alert dialog.
 * @property content - (Optional) Custom React node rendered below the description. Useful for interactive content such as a copyable value.
 * @property cancelBtnText - (Optional) Custom text for the cancel button. Defaults to a standard label.
 * @property confirmBtnText - (Optional) Custom text for the confirm button. Defaults to a standard label.
 */
type AlertDialogCustomOptions = {
  /** Function to be executed when the confirm button is clicked */
  confirmActionFn: () => void;

  /** Indicates whether the action is destructive. Default is `true`. */
  isDestructive?: boolean;

  /** The title of the alert dialog. Default is `Are you absolutely sure?` */
  title?: string;

  /** A brief description or message displayed in the alert dialog. Default is `This action cannot be undone. Are you sure you want to continue?` */
  description?: string;

  /** Custom React node rendered below the description, such as a copyable value. */
  content?: React.ReactNode;

  /** Custom text for the cancel button. Defaults is `Cancel`. Pass empty string to hide the cancel button. */
  cancelBtnText?: string;

  /** Custom text for the confirm button. Defaults is `Yes, continue`. */
  confirmBtnText?: string;
};

export type { AlertDialogDefaultOptions, AlertDialogCustomOptions };
