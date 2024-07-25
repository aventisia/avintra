
import { provideEmailZodSchema } from "@/features/reset-pwd";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export const useDefineProvideEmailForm = () => {
  // Define form with zod schema
  const form = useForm<z.infer<typeof provideEmailZodSchema>>({
    resolver: zodResolver(provideEmailZodSchema),
    defaultValues: {
      email: localStorage.getItem("userName") ?? "",
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
    isDirty
  };
};
