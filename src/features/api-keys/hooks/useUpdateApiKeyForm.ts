import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";
import { useShallow } from "zustand/react/shallow";
import { useMutation } from "@tanstack/react-query";
import { updateAPIKey } from "../apis/api-keys-api";
import { toast } from "@aventisia/ui/sonner";
import { updateAPIKeyZodSchema } from "../constants/update-api-key-zod-schema";
import { useEffect } from "react";
import { useUpdateApiKeyDialogStore } from "../store/update-api-key-dialog-store";

export const useUpdateAPIKeyForm = () => {
  const { modelId } = useLabelDataStore(
      useShallow((state) => ({
        modelId: state.modelId,
      })),
    );
    const {id, apiKeyName} = useUpdateApiKeyDialogStore();
  const form = useForm<z.infer<typeof updateAPIKeyZodSchema>>({
      resolver: zodResolver(updateAPIKeyZodSchema),
        defaultValues: {
            id: "",
            mlModelId: modelId,
            name: ""
      },
  });

  useEffect(() => {
      form.reset({
        id,
        mlModelId: modelId,
        name: apiKeyName
    })
  }, [form, id ,modelId, apiKeyName])

  const {
      formState: { isSubmitting, isDirty },
      control,
  } = form;

  const { toggleFormDirty } = useUpdateApiKeyDialogStore(
    useShallow((state) => ({
      toggleFormDirty: state.toggleFormDirty,
    })),
  );
    
  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  const { mutateAsync: updateApiKey, isPending: isUpdatePending } =
    useMutation({
      mutationFn: updateAPIKey,
      onError: (error) => {
        toast.error(error.toString() || "Failed to update api key.");
      },
    });


  return {form, control, isSubmitting, isDirty, updateApiKey, isUpdatePending}
}