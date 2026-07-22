import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { userInfoSchema } from "../constants/user-info-zod-schema";

export const useDefineUserInfoForm = () => {
  // Define form with zod schema
  const form = useForm<z.infer<typeof userInfoSchema>>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      country: "India",
    },
  });

  // Destructor form values and methods
  const {
    formState: { isSubmitting },
  } = form;

  // Return form and methods
  return {
    form,
    isSubmitting,
  };
};
