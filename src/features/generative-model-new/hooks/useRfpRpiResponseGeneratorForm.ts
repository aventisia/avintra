import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { rfpRpiResponseGeneratorZodSchema } from "../constants/generative-model-zod-schemas/rfp-rpi-response-generator-dto";


export const useRfpRpiResponseGeneratorForm = () => {
  const form = useForm<z.infer<typeof rfpRpiResponseGeneratorZodSchema>>({
    resolver: zodResolver(rfpRpiResponseGeneratorZodSchema),
    defaultValues: {
        clientName: "",
        clientLink: "",
        rfiRfpDocuments: null,
        responseStrategy: "",
        responseBoundaries: "",
        links: [{id: "", link: ""}],
        referenceDocuments: null,
        configurationType: "OnPrem",
        llm: "gemma",
        nodePrompt: "",
        temperature: 0.2
    },
  });

  const {
    formState: { isDirty, isSubmitting },
  } = form;

  return {
    form,
    isDirty,
    isSubmitting
  };
};
