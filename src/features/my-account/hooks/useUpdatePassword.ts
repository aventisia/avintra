import { useUserSessionStore } from "@/react-toolkit/stores/user-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";
import { useCompanyFormStore } from "../stores/company-form-store";
import { useEffect } from "react";
import { PwdZodSchema } from "../types/pwd-zod-schema";


export const useUpdatePassword = () => {
  // Get user session
  const { userSession } = useUserSessionStore(
    useShallow((state) => ({
      userSession: state.userSession,
    })),
  );

  // Get data-table crud dialog store state and actions
  const {
    crudAction,
    toggleFormDirty,
  } = useCompanyFormStore(
    useShallow((state) => ({
      crudAction: state.crudAction,
      setShowDialog: state.setShowDialog,
      toggleFormDirty: state.toggleFormDirty,
    })),
  );


  const form = useForm<z.infer<typeof PwdZodSchema>>({
    resolver: zodResolver(PwdZodSchema),
    defaultValues: {
      oldPwd: "",
      newPwd: "",
      cofirmNewPwd: "",
      logoffFromOtherSessions: false
    },
  });

  const { formState: { isDirty }, } = form;

  // Refine form data based on crud action
  const refineFormData = (formData: z.infer<typeof PwdZodSchema>) => {
    return {
      ...formData,
      lastModifiedBy: userSession?.email ?? "",
      lastModifiedOn: new Date().toISOString(),
    };
  };


  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  // Return form and methods
  return {
    form,
    crudAction,
    isDirty,
    refineFormData,
  };
};
