import { useCrudDialogUrlState } from "@avplatform/ui/data-table";
import { type DialogCrudAction } from "@avplatform/ui/types";
import { useSearchParams } from "react-router-dom";

import { JobCreateForm } from "./JobCreateForm";
import { JobUpdateForm } from "./JobUpdateForm";

interface JobCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

/**
 * Content adapter for the job CRUD dialog.
 */
export const JobCrudDialogContent = ({ crudAction, rowId }: JobCrudDialogContentProps) => {
  const [searchParams] = useSearchParams();
  const { goBack, closeCrudDialog, back } = useCrudDialogUrlState();

  const defaultMachineId = searchParams.get("mid");

  const handleJobCreated = () => {
    if (back) {
      goBack();
    } else {
      closeCrudDialog();
    }
  };

  if (crudAction === "create") {
    return (
      <JobCreateForm
        defaultMachineId={defaultMachineId ?? undefined}
        onSuccess={handleJobCreated}
      />
    );
  }

  return <JobUpdateForm rowId={rowId} />;
};
