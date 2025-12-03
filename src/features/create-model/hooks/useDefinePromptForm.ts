import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { promptZodSchema } from "../constants/prompt-zod-schema";

export const useDefinePromptForm = () => {
  // Define form with zod schema
  const form = useForm<z.infer<typeof promptZodSchema>>({
    resolver: zodResolver(promptZodSchema),
    defaultValues: {
      userPrompt: "",

      systemPrompt: "",
    },
  });

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
