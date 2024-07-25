import { resetPwdZodSchema } from "@/features/reset-pwd";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const useDefineResetPwdForm = () => {
  // Define form with zod schema
  const form = useForm<z.infer<typeof resetPwdZodSchema>>({
    resolver: zodResolver(resetPwdZodSchema),
    defaultValues: {
      newPwd: "",
      confirmNewPwd: "",
      logoffFromAllSessions: false,
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
  };
};
