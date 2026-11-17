import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { PwdSetZodSchema, PwdZodSchema } from "../types/pwd-zod-schema";

export const useDefineProfilePasswordForm = (hasPassword: boolean) => {
  // Define form with zod schema
  /* IMPORTANT NOTE: It is important to set default value to all fields to avoid error - "A component is changing an uncontrolled input to be controlled". */
  const form = useForm<z.infer<typeof PwdZodSchema>>({
    resolver: zodResolver((hasPassword ? PwdZodSchema : PwdSetZodSchema) as typeof PwdZodSchema),
    defaultValues: {
      oldPwd: "",
      newPwd: "",
      confirmNewPwd: "",
      logoffFromOtherSessions: false,
    },
  });

  // Destructor form values and methods
  const {
    formState: { isDirty },
  } = form;

  // Return form and methods
  return {
    form,
    isDirty,
  };
};
