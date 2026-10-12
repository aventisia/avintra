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
const JOB_CREATE_PREFILL_KEYS = ["mid", "fv", "fvp"];

/**
 * Content adapter for the job CRUD dialog.
 */
export const JobCrudDialogContent = ({ crudAction, rowId }: JobCrudDialogContentProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { back } = useCrudDialogUrlState();

  const rawMid = searchParams.get("mid");
  const rawFv = searchParams.get("fv");
  const rawFvp = searchParams.get("fvp");

  const { defaultMachineOption, defaultFlowVersionOption } = useMemo(() => {
    const flowVersionOption = decodePrefilledOption(rawFv);

    return {
      defaultMachineOption: decodePrefilledOption(rawMid),
      defaultFlowVersionOption:
        flowVersionOption && rawFvp
          ? { ...flowVersionOption, supportedPlatform: rawFvp }
          : flowVersionOption,
    };
  }, [rawMid, rawFv, rawFvp]);

  const handleJobCreated = () => {
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
