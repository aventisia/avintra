import { SubmitButton } from "@avplatform/ui/buttons";
import { AsyncSingleSelectField } from "@avplatform/ui/components/form/fields/AsyncSingleSelectField";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { Form, InputField, SelectField, SwitchField } from "@avplatform/ui/form";
import { useTableRowOptimisticMutation } from "@avplatform/ui/hooks";
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
import { getSelectedId } from "../../utils/job-form-utils";

interface JobCreateFormProps {
  /** Optional machine id to pre-select as the execution location. */
  defaultMachineId?: string;
  /** Optional callback invoked when the job is created successfully. */
  onSuccess?: () => void;
}

/**
 * Form for creating a new job.
 */
export const JobCreateForm = ({ defaultMachineId, onSuccess }: JobCreateFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();
  const { form, isDirty, isValid, refineFormData } = useDefineJobCreateForm({
    defaultMachineId,
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
    () => ({ machineId: getSelectedId(selectedExecutionLocation, "value") }),
    [selectedExecutionLocation],
  );

  const executionLocationFilters = useMemo(
    () => ({ flowVersionId: getSelectedId(selectedFlowVersionId, "value") }),
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
