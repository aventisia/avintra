import { isEmailAvailable } from "@/react-toolkit/apis/accounts-auth-apis";
import { useCheckAvailability } from "@/react-toolkit/hooks/useCheckAvailability";
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  createAccountZodSchema,
  emailSchema,
} from "../constants/create-account-zod-schema";

/**
 * Custom hook that checks the availability of a email and handles validation and error messages.
 *
 * @param form - The form object from react-hook-form.
 * @returns An object containing the availability status, availability message, isCheckPending (check is in progress) status, and input change handler.
 */
export const useIsEmailAvailable = (
  form: UseFormReturn<z.infer<typeof createAccountZodSchema>>,
) => {
  // Email valid/invalid handler
  const isFieldValidHandler = (inputValue: string) => {
    // Create new zod schema that includes only the 'email' field
    const emailZodSchema = z.object({
      email: emailSchema,
    });

    // Validate the email
    const result = emailZodSchema.safeParse({ email: inputValue });

    if (!result.success) {
      // Set field error message
      form.setError("email", {
        type: "mannual",
        message: result.error.errors[0].message,
      });

      // Set availability to null
      setAvailabilityMessage(null);
    } else {
      form.clearErrors("email");
    }

    // Return the result
    return result.success;
  };

  // Handler to set error message when email is not available
  const notAvailableErrorHandler = (inputValue: string) => {
    form.setError("email", {
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
    checkAvailabilityAPIFn: isEmailAvailable,
    isFieldValidFn: isFieldValidHandler,
    notAvailableErrorFn: notAvailableErrorHandler,
  });

  // Reset availability message when component is unmounted
  useEffect(() => {
    return () => setAvailabilityMessage(null);
  }, [setAvailabilityMessage]);

  return {
    isAvailable,
    availabilityMessage,
    setAvailabilityMessage,
    isCheckPending,
    handleInputChange,
  };
};
