import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { verifyEmailZodSchema } from "../constants/verify-email-zod-schema";
import { useCreateAccountStore } from "../stores/create-account-store";

export const useDefineVerifyEmailForm = () => {
  // Get create account store state
  const { createAccountData, verifyEmailData, setStepNo } =
    useCreateAccountStore(
      useShallow((state) => ({
        setStepNo: state.setStepNo,
        createAccountData: state.createAccountData,
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
    createAccountData,
    verifyEmailData,
    setStepNo,
  };
};
