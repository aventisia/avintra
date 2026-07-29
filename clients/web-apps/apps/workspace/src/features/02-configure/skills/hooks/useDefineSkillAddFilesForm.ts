import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { skillAddFilesSchema } from "../constants/skill-files-zod-schema";

export const useDefineSkillAddFilesForm = () => {
  const form = useForm<z.infer<typeof skillAddFilesSchema>>({
    resolver: zodResolver(skillAddFilesSchema),
    defaultValues: {
      fileDescription: "",
    },
  });

  return { form };
};
