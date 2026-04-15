import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { knowledgeBaseRetrievalSchema } from "../constants/kb-retrieval-zod-schema";

export const useDefineKnowledgeBaseRetrievalForm = () => {
  const form = useForm<z.infer<typeof knowledgeBaseRetrievalSchema>>({
    resolver: zodResolver(knowledgeBaseRetrievalSchema),
    defaultValues: {
      query: "",
      numberOfChunks: 100,
      retrievalType: "Basic",
      scoreThreshold: 1.0,
    },
  });

  return {
    form,
  };
};
