import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import { useCheckAvailability } from "@/react-toolkit/hooks/useCheckAvailability";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { isProjectNameAvailable } from "../apis/projects-table-apis";
import {
  projectNameSchema,
  projectZodSchema,
} from "../constants/project-zod-schema";

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
  // Get crud dialog store state
  const { showDialog } = useDTCrudDialogStore(
    useShallow((state) => ({
      showDialog: state.crudDialogOptions.showDialog,
    })),
  );

  // Project name valid/invalid handler
  const isFieldValidHandler = (inputValue: string) => {
    // Create new schema that includes only the project 'name' field
    const projectNameZodSchema = z.object({
      name: projectNameSchema,
    });

    // Validate the project name
    const result = projectNameZodSchema.safeParse({ name: inputValue });

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

  // Handler to set error message when project name is not available
  const notAvailableErrorHandler = (inputValue: string) => {
    form.setError("name", {
      type: "Red",
      message: `${inputValue} is already taken`,
    });
  };

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability({
    defaultInputValue: projectName,
    checkAvailabilityAPIFn: isProjectNameAvailable,
    isFieldValidFn: isFieldValidHandler,
    notAvailableErrorFn: notAvailableErrorHandler,
  });

  // Reset availability message when dialog closes
  useEffect(() => {
    if (!showDialog) setAvailabilityMessage(null);
  }, [setAvailabilityMessage, showDialog]);

  return {
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
