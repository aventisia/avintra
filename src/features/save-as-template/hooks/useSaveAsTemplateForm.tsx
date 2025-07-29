import { useFetchModel } from "@/features/label-data/hooks/useFetchModel";
import { ModelLibraryTableDto } from "@/features/model-library-table/dtos/model-library-table-dto";

import { toast } from "@aventisia/ui/sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router-dom";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { publishTemplate } from "../apis/save-as-template-apis";
import { saveAsTemplateZodSchema } from "../constants/save-as-template-zod-schema";
import { useSaveAsTemplateDialogStore } from "../store/useSaveAsTemplateDialog";

export const useSaveAsTemplateForm = () => {
  const { data } = useFetchModel();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = data?.data.id || queryParams.get("mid") || "";
  // const modelName = data?.data.name || "";
  // const modelDescription = data?.data.description || "";

  const form = useForm<z.infer<typeof saveAsTemplateZodSchema>>({
    resolver: zodResolver(saveAsTemplateZodSchema),
    defaultValues: {
      refId: "",
      name: "",
      description: "",
      accessType: "",
      spaceIds: [],
      tags: [],
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const modelData = queryClient.getQueryData<{
      data: ModelLibraryTableDto;
    }>(["model", modelId]);

    form.reset({
      refId: modelData?.data.id ?? modelId ?? "",
      name: modelData?.data.name ?? "",
      description: modelData?.data.description ?? "",
      accessType: "",
      spaceIds: [],
      tags: [],
    });
  }, [form, queryClient, modelId]);

  const {
    formState: { isSubmitting, isDirty },
    control,
  } = form;

  const { toggleFormDirty } = useSaveAsTemplateDialogStore(
    useShallow((state) => ({
      toggleFormDirty: state.toggleFormDirty,
    })),
  );

  // Save the form dirty state
  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  // Mutation to publish Template
  const {
    mutateAsync: publishModelTemplate,
    isPending: isPublishTemplatePending,
  } = useMutation({
    mutationFn: publishTemplate,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["INFERENCE_SETUP_FORM_DATA"],
      });
      queryClient.invalidateQueries({
        queryKey: ["model", modelId],
      });
      toast.success("Model saved a template");
    },
    onError: (error) => {
      toast.error(error.toString() || "Failed to save model as Template");
    },
  });

  return {
    form,
    isSubmitting,
    isDirty,
    control,
    publishModelTemplate,
    isPublishTemplatePending,
  };
};
