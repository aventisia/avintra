import { twoFAZodSchema, useLoginStore } from "@/features/login";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useShallow } from "zustand/react/shallow";

export const useDefineTwoFAForm = () => {
  // Get store state
  const { twoFACodeData, resetLoginProcess } = useLoginStore(
    useShallow((state) => ({
      twoFACodeData: state.twoFACodeData,
      resetLoginProcess: state.resetLoginProcess,
    })),
  );

  // Define form with zod schema
  const form = useForm<z.infer<typeof twoFAZodSchema>>({
    resolver: zodResolver(twoFAZodSchema),
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
    twoFACodeData,
    resetLoginProcess,
  };
};
