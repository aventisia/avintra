import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { type FieldPath, type FieldValues, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { type ZodTypeAny, z } from "zod";

import type { CheckAvailabilityDto, IHttpResponse, TrueFalseResultDto } from "@/ui/dtos";
import { type CustomFormMessage, type CustomMessageType } from "@/ui/types";
import { getMutationErrorMessage } from "@/ui/utils";

type CheckAvailabilityParams<T extends FieldValues, TFieldSchema extends ZodTypeAny> = {
  /** The default input value (database value) in case of update operation. */
  defaultInputValue?: string;

  /** The debounce time in milliseconds. Default is 500ms. */
  debounceTime?: number;

  /** The name of the form field. */
  fieldName: FieldPath<T>;

  /** The react-hook-form useForm object */
  form: UseFormReturn<T>;

  fieldSchema: TFieldSchema;

  /** The API function to check availability. */
  checkAvailabilityAPIFn: (
    postObj: CheckAvailabilityDto,
  ) => Promise<IHttpResponse<TrueFalseResultDto>>;
};

export const useCheckAvailability = <T extends FieldValues, TFieldSchema extends ZodTypeAny>({
  defaultInputValue,
  debounceTime = 1000,
  fieldName,
  form,
  fieldSchema,
  checkAvailabilityAPIFn,
}: CheckAvailabilityParams<T, TFieldSchema>) => {
  // ---------------------------Local state
  const [availabilityMessage, setAvailabilityMessage] = useState<CustomFormMessage | null>(null); // Set check availability non-error message state
  const [inputValue, setInputValue] = useState(defaultInputValue ?? ""); // Set current input value state
  const [isCheckRequired, setIsCheckRequired] = useState(false); // Set if check is required or not
  const [isAvailable, setIsAvailable] = useState(true); // Set availability status state

  // ---------------------------Define mutation to check availability
  const { mutate: checkAvailabilityMutation, isPending: isCheckPending } = useMutation({
    mutationFn: checkAvailabilityAPIFn,
    onSuccess: (httpResponse, variables) => {
      // Available
      if (httpResponse.data.result) {
        setIsAvailable(true);
        availabilityMessageSetter("Green", variables.userInput);
      }
      // Not-available
      else {
        setIsAvailable(false);
        notAvailableErrorHandler(variables.userInput);
      }
    },
    onError: (error) => {
      toast.error(getMutationErrorMessage(error));
    },
    onSettled: (_, __, variables) => {
      if (inputValue !== variables.userInput) return; // Input value has changed
      setIsCheckRequired(false); // Stop checking
    },
  });

  // ---------------------------Function to perform availablity check
  const checkNow = useCallback(
    (postObj: CheckAvailabilityDto) => {
      checkAvailabilityMutation(postObj);
    },
    [checkAvailabilityMutation],
  );

  // ---------------------------Debounce on input change
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!isCheckRequired) return; // Input text is same as previous input value

      checkNow({ userInput: inputValue }); // Start checking availability
    }, debounceTime); // Debounce save operation
    return () => clearTimeout(handler); // Cleanup function to clear timeout on unmount or state change
  }, [isCheckRequired, checkNow, inputValue, debounceTime]);

  // ---------------------------Field value is valid/invalid handler
  const isFieldValidHandler = (inputValue: string) => {
    const fieldZodSchema = z.object({ fieldName: fieldSchema }); // Define the field zod schema
    const result = fieldZodSchema.safeParse({ fieldName: inputValue }); // Validate the name

    if (!result.success) {
      // Set field error message
      form.setError(fieldName, {
        type: "mannual",
        message: result.error.errors[0].message,
      });

      setAvailabilityMessage(null); // Set availability to null
    } else {
      form.clearErrors(fieldName);
    }

    // Return the result
    return result.success;
  };

  // ---------------------------Handler to set error message when name is not available
  const notAvailableErrorHandler = (inputValue: string) => {
    form.setError(fieldName, {
      type: "Red",
      message: `${inputValue} is already taken`,
    });
  };

  // ---------------------------Availability status message setter
  const availabilityMessageSetter = useCallback(
    (messageType: CustomMessageType, inputValue: string) => {
      switch (messageType) {
        case "Gray":
          setAvailabilityMessage({
            type: messageType,
            message: `Checking availability...`,
          });
          break;
        case "Green":
          setAvailabilityMessage({
            type: messageType,
            message: `${inputValue} is available`,
          });
          break;
        default:
          setAvailabilityMessage(null);
      }
    },
    [],
  );

  // ---------------------------Handle input change
  const handleInputChange = (currentInputValue: string) => {
    setIsAvailable(false); // Reset availability status
    setInputValue(currentInputValue); // Set input value
    setIsCheckRequired(false); // Set check required

    // Input is Invalid
    if (!isFieldValidHandler(currentInputValue)) return;

    // Input value is same as initial value (database value)
    if (currentInputValue === defaultInputValue) {
      setIsAvailable(true); // Set availability status
      availabilityMessageSetter("None", ""); // Clear message
      return;
    }
    availabilityMessageSetter("Gray", currentInputValue); // Set message to Checking availability
    setIsCheckRequired(true); // Set check required
  };

  // ---------------------------Return the state and methods
  return {
    inputValue,
    isAvailable,
    checkAvailabilityMutation,
    handleInputChange,
    isCheckPending,
    availabilityMessage,
    setAvailabilityMessage,
  };
};
