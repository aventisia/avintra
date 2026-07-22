import { type CustomFormMessage } from "@/ui/types";

interface BaseFieldProps {
  /** The label of the form field. */
  label?: string;

  /**
   * Indicates if the form field is required by showing an asterisk (*) next to the label.
   *
   * Note: This is only used for rendering the label and does not enforce validation.
   */
  isRequired?: boolean;

  /** The description of the form field. */
  description?: string;

  /** Prop to add custom message to the form field which are not errors. */
  nonErrorMessage?: CustomFormMessage | null;
}

export type { BaseFieldProps };
