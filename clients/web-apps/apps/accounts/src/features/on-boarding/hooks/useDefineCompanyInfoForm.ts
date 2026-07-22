import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { companyInfoSchema } from "@/features/on-boarding/constants/company-info-zod-schema";
import { USER_NAME_LS_KEY } from "@/react-toolkit/constants";

export const useDefineCompanyInfoForm = () => {
  // Define form with zod schema
  const form = useForm<z.infer<typeof companyInfoSchema>>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      organizationName: "",
      domain: localStorage.getItem(USER_NAME_LS_KEY)?.split("@")[1] ?? "",
      numberOfEmployees: "",
      country: "",
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
