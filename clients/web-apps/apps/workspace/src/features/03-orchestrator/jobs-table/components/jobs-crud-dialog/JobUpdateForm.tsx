import { SubmitButton } from "@avplatform/ui/buttons";
import { useCrudDialogDirty } from "@avplatform/ui/data-table";
import { Form, InputField, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useTableRowOptimisticMutation } from "@avplatform/ui/hooks";
import { useEffect } from "react";

import { updateJob } from "../../apis/jobs-table-apis";
import {
  closingStatusProps,
  enableClosingStatusProps,
  idProps,
  priorityProps,
  remarksProps,
} from "../../constants/job-form-field-props";
import { JobUpdateFormData } from "../../constants/job-update-zod-schema";
import { DATA_QUERY_KEY } from "../../constants/variables";
import { JobUpdateDto } from "../../dtos/job-update-dto";
import { JobsTableRowDto } from "../../dtos/jobs-table-row-dto";
import { useDefineJobUpdateForm } from "../../hooks/useDefineJobUpdateForm";

interface JobUpdateFormProps {
  rowId: string;
}

/**
 * Form for updating an existing job.
 */
export const JobUpdateForm = ({ rowId }: JobUpdateFormProps) => {
  const { onCloseConfirmed } = useCrudDialogDirty();
  const { form, isDirty, isValid, refineFormData } = useDefineJobUpdateForm({ rowId });

  const isClosingStatusEnabled = form.watch("isClosingStatusEnabled");

  const {
    mutate: mutateJob,
    isPending,
    isSuccess,
  } = useTableRowOptimisticMutation<JobUpdateDto, JobsTableRowDto, JobsTableRowDto>(
    "update",
    [rowId],
    updateJob,
    DATA_QUERY_KEY,
  );

  const onSubmit = (formData: JobUpdateFormData) => {
    mutateJob(refineFormData(formData));
  };

  useEffect(() => {
    if (isSuccess) onCloseConfirmed();
  }, [isSuccess, onCloseConfirmed]);

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)} className="px-2.5 pb-5">
      <InputField {...idProps} />

      <SelectField {...priorityProps} />

      <SwitchField {...enableClosingStatusProps} />

      {isClosingStatusEnabled && <SelectField {...closingStatusProps} />}

      {isClosingStatusEnabled && <TextareaField {...remarksProps} />}

      <div className="!mt-5 flex w-full justify-end">
        <SubmitButton
          className="min-w-[5rem]"
          primaryText="Save changes"
          secondaryText="Saving..."
          isPending={isPending}
          disabled={!isDirty || !isValid || isPending}
        />
      </div>
    </Form>
  );
};
