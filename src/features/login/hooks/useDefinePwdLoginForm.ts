import { pwdLoginZodSchema, useLoginStore } from "@/features/login";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useShallow } from "zustand/react/shallow";

export const useDefinePwdLoginForm = () => {
  // Get store state
  const { loginData, resetLoginProcess, setLoginData } = useLoginStore(
    useShallow((state) => ({
      loginData: state.loginData,
      resetLoginProcess: state.resetLoginProcess,
      setLoginData: state.setLoginData,
    })),
  );

  // Define form with zod schema
  const form = useForm<z.infer<typeof pwdLoginZodSchema>>({
    resolver: zodResolver(pwdLoginZodSchema),
    defaultValues: {
      email: loginData?.email,
      pwd: "",
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
    loginData,
    resetLoginProcess,
    setLoginData,
  };
};
