import { verifyCodeZodSchema, useResetPwdStore } from "@/features/reset-pwd";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useShallow } from "zustand/react/shallow";

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
