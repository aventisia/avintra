import { SubmitButton } from "@avplatform/ui/buttons";
import { AsyncSingleSelectField } from "@avplatform/ui/components/form/fields/AsyncSingleSelectField";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { Form, InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { useTableRowOptimisticMutation } from "@avplatform/ui/hooks";
import { type ISelectOption } from "@avplatform/ui/types";
import { useEffect, useMemo, useRef } from "react";
import { useWatch } from "react-hook-form";

import { JsonEditorField } from "@/components/json-editor/JsonEditorField";

import { insertJob } from "../../apis/jobs-table-apis";
import { JobCreateFormData } from "../../constants/job-create-zod-schema";
import {
  executeOnCloudProps,
  executionLocationProps,
  existingJobIdProps,
  flowVersionIdProps,
  jobInputDataProps,
  priorityProps,
  triggerTypeProps,
} from "../../constants/job-form-field-props";
import { DATA_QUERY_KEY } from "../../constants/variables";
import { JobInsertDto } from "../../dtos/job-insert-dto";
import { JobsTableRowDto } from "../../dtos/jobs-table-row-dto";
import { useDefineJobCreateForm } from "../../hooks/useDefineJobCreateForm";

interface JobCreateFormProps {
  /** Optional machine option to pre-select as the execution location. */
  defaultMachineOption?: ISelectOption;
  /** Optional agent option to pre-select for the job. */
  defaultFlowVersionOption?: ISelectOption;
  /** Optional callback invoked when the job is created successfully. */
  onSuccess?: () => void;
}

/**
 * Form for creating a new job.
 */
export const JobCreateForm = ({
  defaultMachineOption,
  defaultFlowVersionOption,
  onSuccess,
}: JobCreateFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();
  const { form, isDirty, isValid, refineFormData } = useDefineJobCreateForm({
    defaultMachineOption,
    defaultFlowVersionOption,
  });
  const agentSelectWrapperRef = useRef<HTMLDivElement | null>(null);
  const executionLocationWrapperRef = useRef<HTMLDivElement | null>(null);

  const executeOnCloud = useWatch({
    control: form.control,
    name: "executeOnCloud",
  });

  const selectedFlowVersionId = useWatch({
    control: form.control,
    name: "flowVersionId",
  });

  const selectedExecutionLocation = useWatch({
    control: form.control,
    name: "executionLocation",
  });

  const flowVersionIdFilters = useMemo(
    () => ({
      machineId:
        selectedExecutionLocation && typeof selectedExecutionLocation === "object"
          ? (selectedExecutionLocation as ISelectOption).value
          : (selectedExecutionLocation as string) || null,
    }),
    [selectedExecutionLocation],
  );

  const executionLocationFilters = useMemo(
    () => ({
      flowVersionId:
        selectedFlowVersionId && typeof selectedFlowVersionId === "object"
          ? (selectedFlowVersionId as ISelectOption).value
          : (selectedFlowVersionId as string) || null,
    }),
    [selectedFlowVersionId],
  );

  const {
    mutate: mutateJob,
    isPending,
    isSuccess,
  } = useTableRowOptimisticMutation<JobInsertDto, JobsTableRowDto, JobsTableRowDto>(
    "create",
    [],
    insertJob,
    DATA_QUERY_KEY,
  );

  const onSubmit = (formData: JobCreateFormData) => {
    mutateJob(refineFormData(formData));
  };

  useEffect(() => {
    if (!isSuccess) return;

    if (onSuccess) {
      onSuccess();
    } else {
      onCloseConfirmed();
    }
  }, [isSuccess, onSuccess, onCloseConfirmed]);

  // Focus the agent search input when the dialog opens so focus is not stuck on the close button.
  useEffect(() => {
    if (agentSelectWrapperRef.current) {
      const input = agentSelectWrapperRef.current.querySelector('input[type="text"]');
      if (input instanceof HTMLInputElement) {
        input.focus();
      }
    }
  }, []);

  // Focus the machine search input immediately when the field becomes visible
  // so the user can reach it with a single click/tab instead of two.
  useEffect(() => {
    if (!executeOnCloud && executionLocationWrapperRef.current) {
      const input = executionLocationWrapperRef.current.querySelector('input[type="text"]');
      if (input instanceof HTMLInputElement) {
        input.focus();
      }
    }
  }, [executeOnCloud]);

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="px-2.5 pb-5">
      <div className="space-y-3.5">
        <SelectField {...triggerTypeProps} />

        <SelectField {...priorityProps} />

        <div ref={agentSelectWrapperRef}>
          <AsyncSingleSelectField {...flowVersionIdProps} filters={flowVersionIdFilters} />
        </div>

        <SwitchField {...executeOnCloudProps} />

        {!executeOnCloud && (
          <div ref={executionLocationWrapperRef}>
            <AsyncSingleSelectField
              {...executionLocationProps}
              filters={executionLocationFilters}
            />
          </div>
        )}

        <JsonEditorField {...jobInputDataProps} />

        <InputField {...existingJobIdProps} />
      </div>

      <div className="!mt-5 flex w-full justify-end">
        <SubmitButton
          className="min-w-[5rem]"
          primaryText="Create"
          secondaryText="Creating..."
          isPending={isPending}
          disabled={!isDirty || !isValid || isPending}
        />
      </div>
    </Form>
  );
};
