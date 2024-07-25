import {
  projectZodSchema,
  isProjectNameAvailable,
} from "@/features/projects-table";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  CustomMessageType,
  CustomFormMessage,
  useCheckAvailability,
} from "@/react-toolkit/components/form";
import { useState } from "react";

/**
 * Custom hook that checks the availability of a project name and handles validation and error messages.
 *
 * @param form - The form object from react-hook-form.
 * @param projectName - The project name to check availability for.
 * @returns An object containing the availability status, availability message, isCheckPending (check is in progress) status, and input change handler.
 */
export const useIsProjectNameAvailable = (
  form: UseFormReturn<z.infer<typeof projectZodSchema>>,
  projectName: string,
) => {
  // Set check availability non-error message state
  const [availabilityMessage, setAvailabilityMessage] =
    useState<CustomFormMessage | null>(null);

  // Project name valid/invalid handler
  const isFieldValidHandler = (value: string) => {
    // Create new schema that includes only the project 'name' field
    const projectNameZodSchema = projectZodSchema.pick({ name: true });

    // Validate the project name
    const result = projectNameZodSchema.safeParse({ name: value });

    if (!result.success) {
      // Set field error message
      form.setError("name", {
        type: "mannual",
        message: result.error.errors[0].message,
      });

      // Set availability to null
      setAvailabilityMessage(null);
    } else {
      form.clearErrors("name");
    }

    // Return the result
    return result.success;
  };

  // Project name availability status message handler
  const availabilityMessageHandler = (
    errorType: CustomMessageType,
    userInput: string,
  ) => {
    switch (errorType) {
      case "Gray":
        setAvailabilityMessage({
          type: errorType,
          message: `Checking availability...`,
        });
        break;
      case "Red":
        form.setError("name", {
          type: errorType,
          message: `${userInput} is already taken`,
        });
        break;
      case "Green":
        setAvailabilityMessage({
          type: errorType,
          message: `${userInput} is available`,
        });
        break;
      default:
        setAvailabilityMessage(null);
    }
  };

  // Get check availability state and methods
  const { isAvailable, isCheckPending, handleInputChange } =
    useCheckAvailability({
      defaultInputValue: projectName,
      checkAvailabilityAPIFn: isProjectNameAvailable,
      isFieldValidHandler: isFieldValidHandler,
      availabilityMessageHandler: availabilityMessageHandler,
    });

  return {
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
