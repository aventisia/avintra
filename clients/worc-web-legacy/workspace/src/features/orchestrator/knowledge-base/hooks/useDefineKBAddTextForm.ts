import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { kbAddTextSchema } from "../constants/kb-add-text-zod-schema";

export const useDefineKBAddTextForm = () => {
  const form = useForm<z.infer<typeof kbAddTextSchema>>({
    resolver: zodResolver(kbAddTextSchema),
    defaultValues: {
      textContent: "",
      chunkSize: 500,
      chunkOverlap: 50, //  10% of Chunk size
    },
  });

  return {
    form,
  };
};
