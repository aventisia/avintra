import { isEmailAvailable } from "@/react-toolkit/apis/accounts-auth-apis";
import { useCheckAvailability } from "@/react-toolkit/hooks/useCheckAvailability";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { updateEmailZodSchema, emailSchema } from "../types/create-account-zod-schema";
import { useProfileEmailUpdateStore } from "../stores/profile-security-tab-store";

export const useDefineEmailUpdateForm = () => {
  // Get update email store state
  const { updateProfileEmailData, setUpdateProfileEmailData } = useProfileEmailUpdateStore(
    useShallow((state) => ({
      updateProfileEmailData: state.updateProfileEmailData,
      setUpdateProfileEmailData: state.setUpdateProfileEmailData,
    })),
  );

  // Define form with zod schema
  const form = useForm<z.infer<typeof updateEmailZodSchema>>({
    resolver: zodResolver(updateEmailZodSchema),
    defaultValues: {
      email: updateProfileEmailData?.email ?? "",
    },
  });

  // Destructor form values and methods
  const {
    formState: { isSubmitting, isDirty },
  } = form;

  // Get check availability state and methods
  const {
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  } = useCheckAvailability<z.infer<typeof updateEmailZodSchema>, z.ZodString>({
    fieldName: "email",
    form,
    fieldSchema: emailSchema,
    checkAvailabilityAPIFn: isEmailAvailable,
  });

  // Return form and methods
  return {
    form,
    isSubmitting,
    isDirty,
    setUpdateProfileEmailData,
    isAvailable,
    isCheckPending,
    handleInputChange,
    availabilityMessage,
    setAvailabilityMessage,
  };
};
