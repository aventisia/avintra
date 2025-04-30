import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { resetPwdZodSchema } from "../constants/reset-pwd-zod-schema";

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
