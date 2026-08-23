import { useCrudDialogUrlState } from "@avplatform/ui/data-table";
import { type DialogCrudAction } from "@avplatform/ui/types";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import { buildDialogCloseParams } from "@/ui/components/data-table/crud-dialog-url.util";

import { decodePrefilledOption } from "../../utils/decode-prefilled-option.util";
import { JobCreateForm } from "./JobCreateForm";
import { JobUpdateForm } from "./JobUpdateForm";
import { JobView } from "./JobView";

interface JobCrudDialogContentProps {
  crudAction: DialogCrudAction;
  rowId: string;
}

/** Prefill params injected when opening the create-job dialog from a machine. */
const JOB_CREATE_PREFILL_KEYS = ["mid", "fv"];

/**
 * Content adapter for the job CRUD dialog.
 */
export const JobCrudDialogContent = ({ crudAction, rowId }: JobCrudDialogContentProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { back } = useCrudDialogUrlState();

  const rawMid = searchParams.get("mid");
  const rawFv = searchParams.get("fv");

  // Decode once per raw query value. Memoizing on the raw strings (not the decoded
  // objects) keeps the returned option references stable across re-renders, so
  // downstream form-reset effects don't fire and wipe user edits (e.g. toggling
  // "Execute it on Cloud" off).
  const { defaultMachineOption, defaultFlowVersionOption } = useMemo(
    () => ({
      defaultMachineOption: decodePrefilledOption(rawMid),
      defaultFlowVersionOption: decodePrefilledOption(rawFv),
    }),
    [rawMid, rawFv],
  );

  const handleJobCreated = () => {
    // Remove the prefill params and the dialog params in a single URL update,
    // restoring the machine view when the dialog was opened with a `back` state.
    const next = buildDialogCloseParams({
      current: searchParams,
      back,
      extraKeys: JOB_CREATE_PREFILL_KEYS,
    });

    setSearchParams(next, { replace: true });
  };

  if (crudAction === "read") {
    return <JobView rowId={rowId} />;
  }

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
