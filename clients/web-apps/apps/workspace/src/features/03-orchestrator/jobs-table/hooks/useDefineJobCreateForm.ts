import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { type ISelectOption } from "@avplatform/ui/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
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
  defaultMachineOption?: ISelectOption;
  defaultFlowVersionOption?: ISelectOption;
}

/**
 * Custom hook for defining the create job form.
 */
export const useDefineJobCreateForm = ({
  defaultMachineOption,
  defaultFlowVersionOption,
}: UseDefineJobCreateFormOptions = {}) => {
  const { setIsDirty } = useCrudDialogDirty();

  const defaultValues: JobCreateFormData = useMemo(
    () => ({
      flowVersionId: defaultFlowVersionOption ?? "",
      triggerType: TriggerTypesEnum.Manual,
      priority: JobPriorityEnum.Normal,
      executeOnCloud: !defaultMachineOption,
      executionLocation: defaultMachineOption ?? "",
      jobInputData: DEFAULT_JOB_INPUT_DATA,
      existingJobId: "",
    }),
    [defaultMachineOption, defaultFlowVersionOption],
  );

  const form = useForm<JobCreateFormData>({
    resolver: zodResolver(jobCreateZodSchema),
    mode: "onChange",
    defaultValues,
  });

  const {
    formState: { isDirty, isValid },
  } = form;

  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  const refineFormData = (formData: JobCreateFormData): JobInsertDto => ({
    flowVersionId:
      typeof formData.flowVersionId === "object" && formData.flowVersionId
        ? formData.flowVersionId.value
        : formData.flowVersionId,
    triggerType: formData.triggerType,
    priority: formData.priority,
    executionLocation: formData.executeOnCloud
      ? "Cloud"
      : typeof formData.executionLocation === "object" && formData.executionLocation
        ? formData.executionLocation.value
        : formData.executionLocation,
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
