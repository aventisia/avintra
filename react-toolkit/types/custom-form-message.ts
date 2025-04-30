/**
 * Custom form message types.
 *
 * - None: No message.
 * - Gray: Gray color message.
 * - Yellow: Yellow color message with warning icon.
 * - Red: Red color error message with cross icon. This will used to set mannual form error message with icon.
 * - Green: Green color message with check icon.
 */
export type CustomMessageType = "None" | "Gray" | "Yellow" | "Red" | "Green";

/** Custom form message type to show messages (which are not errors) in the place of error message in form field. */
export type CustomFormMessage = {
  type: CustomMessageType;
  message: string;
};
