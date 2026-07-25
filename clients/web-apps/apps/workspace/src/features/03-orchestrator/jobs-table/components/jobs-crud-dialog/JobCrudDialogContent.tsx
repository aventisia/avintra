import { useCrudDialogUrlState } from "@avplatform/ui/data-table";
import { type DialogCrudAction } from "@avplatform/ui/types";
import { useSearchParams } from "react-router-dom";

import { decodePrefilledOption } from "../../utils/decode-prefilled-option.util";
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

  const defaultMachineOption = decodePrefilledOption(searchParams.get("mid"));
  const defaultFlowVersionOption = decodePrefilledOption(searchParams.get("fv"));

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
        defaultMachineOption={defaultMachineOption}
        defaultFlowVersionOption={defaultFlowVersionOption}
        onSuccess={handleJobCreated}
      />
    );
  }

  return <JobUpdateForm rowId={rowId} />;
};
