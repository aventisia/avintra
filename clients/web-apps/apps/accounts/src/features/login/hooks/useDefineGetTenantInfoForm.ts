import { USER_NAME_LS_KEY } from "@avplatform/ui/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { tenantInfoZodSchema } from "../constants/tenant-info-zod-schema";

export const useDefineGetTenantInfoForm = () => {
  // Define form with zod schema
  const form = useForm<z.infer<typeof tenantInfoZodSchema>>({
    resolver: zodResolver(tenantInfoZodSchema),
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
