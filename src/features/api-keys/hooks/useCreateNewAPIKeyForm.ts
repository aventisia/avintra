import { useForm } from "react-hook-form";
import { z } from "zod";
import { createNewAPIKeyZodSchema } from "../constants/create-new-api-key-zod-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import { useMutation } from "@tanstack/react-query";
import { insertAPIKey } from "../apis/api-keys-api";
import { toast } from "@aventisia/ui/sonner";
import { useCreateNewApiKeyDialogStore } from "../store/create-new-api-key-dialog-store";
import { useEffect } from "react";

export const useCreateNewAPIKeyForm = () => {
  const { modelId } = useLabelDataStore(
      useShallow((state) => ({
        modelId: state.modelId,
      })),
    );
  const form = useForm<z.infer<typeof createNewAPIKeyZodSchema>>({
      resolver: zodResolver(createNewAPIKeyZodSchema),
        defaultValues: {
            mlModelId: modelId,
            name: ""
        },
      });
  const {
      formState: { isSubmitting, isDirty },
        control,
  } = form;

  const { toggleFormDirty } = useCreateNewApiKeyDialogStore(
      useShallow((state) => ({
        toggleFormDirty: state.toggleFormDirty,
      })),
    );
  
    // Save the form dirty state
    useEffect(() => {
      toggleFormDirty(isDirty);
    }, [isDirty, toggleFormDirty]);

  const { mutateAsync: addApiKey, isPending: isUpdatePending } =
    useMutation({
      mutationFn: insertAPIKey,
      onError: (error) => {
        toast.error(error.toString() || "Failed to add api key.");
      },
    });


  return {form, control, isSubmitting, isDirty, addApiKey, isUpdatePending}
}