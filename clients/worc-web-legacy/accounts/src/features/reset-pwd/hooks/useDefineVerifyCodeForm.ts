import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { verifyCodeZodSchema } from "../constants/verify-code-zod-schema";
import { useResetPwdStore } from "../stores/reset-pwd-store";

export const useDefineVerifyCodeForm = () => {
  // Get store state
  const { verifyCodeData, setStepNo } = useResetPwdStore(
    useShallow((state) => ({
      verifyCodeData: state.verifyCodeData,
      setStepNo: state.setStepNo,
    })),
  );

  // Define form with zod schema
  const form = useForm<z.infer<typeof verifyCodeZodSchema>>({
    resolver: zodResolver(verifyCodeZodSchema),
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
    verifyCodeData,
    setStepNo,
  };
};
