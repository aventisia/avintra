import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { kbAddFilesSchema } from "../constants/kb-add-files-zod-schema";

export const useDefineKBAddFilesForm = () => {
  const form = useForm<z.infer<typeof kbAddFilesSchema>>({
    resolver: zodResolver(kbAddFilesSchema),
    defaultValues: {
      chunkSize: 500,
      chunkOverlap: 50, //  10% of Chunk size
    },
  });

  return { form };
};
