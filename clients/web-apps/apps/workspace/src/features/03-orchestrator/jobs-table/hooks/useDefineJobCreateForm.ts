import { useDTCrudDialogStore } from "@avplatform/ui/stores";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  DEFAULT_JOB_INPUT_DATA,
  type JobCreateFormData,
  JobInsertDto,
  JobPriorityEnum,
  TriggerTypesEnum,
  jobCreateZodSchema,
  parseJsonEditorValue,
} from "..";

/**
 * Custom hook for defining the create job form.
 */
export const useDefineJobCreateForm = () => {
  const {
    crudDialogOptions: { rowId },
    toggleFormDirty,
    setShowDialog,
  } = useDTCrudDialogStore((state) => ({
    crudDialogOptions: state.crudDialogOptions,
    setShowDialog: state.setShowDialog,
    toggleFormDirty: state.toggleFormDirty,
  }));

  const queryClient = useQueryClient();

  const form = useForm<JobCreateFormData>({
    resolver: zodResolver(jobCreateZodSchema),
    mode: "onChange",
    defaultValues: {
      flowVersionId: "",
      triggerType: TriggerTypesEnum.Manual,
      priority: JobPriorityEnum.Normal,
      executeOnCloud: true,
      executionLocation: "",
      jobInputData: DEFAULT_JOB_INPUT_DATA,
      existingJobId: "",
    },
  });

  const {
    formState: { isDirty, isValid },
  } = form;

  useEffect(() => {
    form.reset();
  }, [form, queryClient, rowId]);

  const refineFormData = (formData: JobCreateFormData): JobInsertDto => ({
    flowVersionId: formData.flowVersionId,
    triggerType: formData.triggerType,
    priority: formData.priority,
    executionLocation: formData.executeOnCloud ? "Cloud" : formData.executionLocation,
    jobInputData:
      formData.jobInputData === DEFAULT_JOB_INPUT_DATA
        ? undefined
        : parseJsonEditorValue(formData.jobInputData),
    existingJobId:
      formData.existingJobId?.trim() === "" ? undefined : formData.existingJobId?.trim(),
  });

  useEffect(() => {
    toggleFormDirty(isDirty);
  }, [isDirty, toggleFormDirty]);

  return {
    form,
    isDirty,
    isValid,
    rowId,
    setShowDialog,
    refineFormData,
  };
};
