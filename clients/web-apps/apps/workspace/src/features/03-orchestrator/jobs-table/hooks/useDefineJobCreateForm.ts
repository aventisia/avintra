import { useCrudDialogDirty } from "@avplatform/ui/data-table";
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

interface UseDefineJobCreateFormOptions {
  defaultMachineId?: string;
}

/**
 * Custom hook for defining the create job form.
 */
export const useDefineJobCreateForm = ({
  defaultMachineId,
}: UseDefineJobCreateFormOptions = {}) => {
  const { setIsDirty } = useCrudDialogDirty();
  const queryClient = useQueryClient();

  const form = useForm<JobCreateFormData>({
    resolver: zodResolver(jobCreateZodSchema),
    mode: "onChange",
    defaultValues: {
      flowVersionId: "",
      triggerType: TriggerTypesEnum.Manual,
      priority: JobPriorityEnum.Normal,
      executeOnCloud: !defaultMachineId,
      executionLocation: defaultMachineId ?? "",
      jobInputData: DEFAULT_JOB_INPUT_DATA,
      existingJobId: "",
    },
  });

  const {
    formState: { isDirty, isValid },
  } = form;

  useEffect(() => {
    form.reset();
  }, [form, queryClient]);

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
    setIsDirty(isDirty);
  }, [isDirty, setIsDirty]);

  return {
    form,
    isDirty,
    isValid,
    refineFormData,
  };
};
