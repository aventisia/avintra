import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { createNewCredentailsFormZodSchema } from "../constants/create-new-credentials-zod-schema";
import { useToggleCreateNewCredentialsDialogStore } from "../store/toggle-add-credentials-store";

export const useCreateNewCredentialsForm = () => {
  const form = useForm<z.infer<typeof createNewCredentailsFormZodSchema>>({
    resolver: zodResolver(createNewCredentailsFormZodSchema),
    defaultValues: {
      apiKey: "",
      baseUrl: "",
      name: "",
      organizationId: "",
    },
  });

  const {
    formState: { isSubmitting, isDirty },
  } = form;

  const { toggleFormDirty } = useToggleCreateNewCredentialsDialogStore(
    useShallow((state) => ({
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  return {
    form,
    isSubmitting,
    isDirty,
  };
};
