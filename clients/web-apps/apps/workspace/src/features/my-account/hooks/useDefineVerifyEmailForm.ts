import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { verifyEmailZodSchema } from "../constants/verify-email-zod-schema";
import { useProfileEmailUpdateStore } from "../stores/profile-email-update-store";

export const useDefineVerifyEmailForm = () => {
  // Get update email store state
  const { updateProfileEmailData, verifyEmailData, setStepNo } = useProfileEmailUpdateStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      updateProfileEmailData: state.updateProfileEmailData,
      verifyEmailData: state.verifyEmailData,
    })),
  );

  // Define form with zod schema
  const form = useForm<z.infer<typeof verifyEmailZodSchema>>({
    resolver: zodResolver(verifyEmailZodSchema),
    defaultValues: {
      verificationCode: "",
    },
  });

  // Destructor form values and methods
  const {
    formState: { isSubmitting, isDirty },
  } = form;

  // Return form and methods
  return {
    form,
    isSubmitting,
    isDirty,
    updateProfileEmailData,
    verifyEmailData,
    setStepNo,
  };
};
