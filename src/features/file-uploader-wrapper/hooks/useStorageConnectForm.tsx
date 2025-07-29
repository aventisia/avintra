import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { storageConnectFormZodSchema } from "../constants/storage-connect-zod-schema";
import { useToggleCredentailsDialogStore } from "../store/toggle-add-credentials-store";

export const useStorageConnectForm = () => {
  const form = useForm<z.infer<typeof storageConnectFormZodSchema>>({
    resolver: zodResolver(storageConnectFormZodSchema),
    defaultValues: {
      credentails: "",
      fileId: "",
      folderId: "",
      scope: "",
    },
  });

  const {
    formState: { isSubmitting, isDirty },
  } = form;

  const { toggleFormDirty } = useToggleCredentailsDialogStore(
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
