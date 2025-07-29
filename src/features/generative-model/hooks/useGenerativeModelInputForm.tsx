import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { generativeModelInputZodSchema } from "../constants/model-input-zod-schema";

export const useGenerativeModelInputForm = () => {
  const form = useForm<z.infer<typeof generativeModelInputZodSchema>>({
    resolver: zodResolver(generativeModelInputZodSchema),
    defaultValues: {
      task: "",
      companyDeepDives: null,
      documentDrafting: null,
      personaResearch: null,
      rfpRpiResponseGenerator: null,
      thoughtLeadership: null,
    },
  });

  const {
    formState: { isDirty, isSubmitting },
    control,
  } = form;

  return {
    form,
    control,
    isDirty,
    isSubmitting,
  };
};
