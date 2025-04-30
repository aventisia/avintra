import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { pwdLoginZodSchema } from "../constants/pwd-login-zod-schema";
import { useLoginStore } from "../stores/login-store";

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
