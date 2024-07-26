import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { createAccountZodSchema } from "../constants/create-account-zod-schema";
import { useCreateAccountStore } from "../stores/create-account-store";

export const useDefineCreateAccountForm = () => {
  // Get create account store state
  const { createAccountData, setCreateAccountData } = useCreateAccountStore(
    useShallow((state) => ({
      createAccountData: state.createAccountData,
      setCreateAccountData: state.setCreateAccountData,
    })),
  );

  // Define form with zod schema
  const form = useForm<z.infer<typeof createAccountZodSchema>>({
    resolver: zodResolver(createAccountZodSchema),
    defaultValues: {
      firstName: createAccountData?.firstName ?? "",
      lastName: createAccountData?.lastName ?? "",
      email: createAccountData?.email ?? "",
      pwd: "",
      confirmPwd: "",
      termsAgreement: false,
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
    setCreateAccountData,
  };
};
