import { USER_NAME_LS_KEY } from "@avplatform/ui/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { provideEmailZodSchema } from "../constants/provide-email-zod-schema";

export const useDefineProvideEmailForm = () => {
  // Define form with zod schema
  const form = useForm<z.infer<typeof provideEmailZodSchema>>({
    resolver: zodResolver(provideEmailZodSchema),
    defaultValues: {
      email: localStorage.getItem(USER_NAME_LS_KEY) ?? "",
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
