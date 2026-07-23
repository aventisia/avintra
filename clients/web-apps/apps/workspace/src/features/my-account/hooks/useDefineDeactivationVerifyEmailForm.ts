import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { deactivationVerifyEmailZodSchema } from "../constants/deactivation-verify-email-zod-schema";
import { useAccountDeactivationStore } from "../stores/account-deactivation-store";

export const useDefineDeactivationVerifyEmailForm = () => {
  // Get update email store state
  const { verifyEmailData, setStepNo } = useAccountDeactivationStore(
    useShallow((state) => ({
      setStepNo: state.setStepNo,
      verifyEmailData: state.verifyEmailData,
    })),
  );

  // Define form with zod schema
  const form = useForm<z.infer<typeof deactivationVerifyEmailZodSchema>>({
    resolver: zodResolver(deactivationVerifyEmailZodSchema),
    defaultValues: {
      verificationCode: "",
    },
  });

  console.log(verifyEmailData);
  // Destructor form values and methods
  const {
    formState: { isSubmitting, isDirty },
  } = form;

  // Return form and methods
  return {
    form,
    isSubmitting,
    isDirty,
    verifyEmailData,
    setStepNo,
  };
};
