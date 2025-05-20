import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";

import { EmailUpdateZodSchema } from "../types/EmailUpdateZodSchema";

export const useDefineProfileEmailForm = () => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  const form = useForm<z.infer<typeof EmailUpdateZodSchema>>({
    resolver: zodResolver(EmailUpdateZodSchema),
    defaultValues: {
      email: userSession?.email,
    },
  });

  useEffect(() => {
    form.reset({
      email: userSession?.email,
    });
  }, []);

  const {
    formState: { isDirty },
  } = form;

  // Return form and methods
  return {
    form,
    isDirty,
  };
};
