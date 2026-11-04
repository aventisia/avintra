import { SubmitButton } from "@avplatform/ui/buttons";
import { CrudDialogActions, useCrudDialogDirty } from "@avplatform/ui/crud-dialog";
import { Form, SelectField, SwitchField, TextareaField } from "@avplatform/ui/form";
import { useTableRowOptimisticMutation } from "@avplatform/ui/hooks";
import { useEffect } from "react";

import { updateJob } from "../../apis/jobs-table-apis";
import {
  closingStatusProps,
  enableClosingStatusProps,
  priorityProps,
  remarksProps,
} from "../../constants/job-form-field-props.constant";
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
    "desc",
    true,
    // Invalidate the job detail query so the read view reflects updates immediately.
    [["job", rowId]],
  );

  const onSubmit = (formData: JobUpdateFormData) => {
    mutateJob(refineFormData(formData));
  };

  useEffect(() => {
    if (isSuccess) onCloseConfirmed();
  }, [isSuccess, onCloseConfirmed]);

  return (
    <Form methods={form} onSubmit={form.handleSubmit(onSubmit)}>
      <SelectField {...priorityProps} />

      <SwitchField {...enableClosingStatusProps} />

      {isClosingStatusEnabled && (
        <>
          <SelectField {...closingStatusProps} />
          <TextareaField {...remarksProps} />
        </>
      )}

      <CrudDialogActions>
        <SubmitButton
          primaryText="Save changes"
          secondaryText="Saving..."
          isPending={isPending}
          disabled={!isDirty || !isValid || isPending}
        />
      </CrudDialogActions>
    </Form>
  );
};
