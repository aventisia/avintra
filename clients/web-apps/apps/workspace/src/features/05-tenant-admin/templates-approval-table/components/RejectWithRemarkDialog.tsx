import { IconTile } from "@avplatform/ui/icon-tile";
import { cn } from "@avplatform/ui/lib";
import { FileXIcon } from "@phosphor-icons/react";
import { useId } from "react";
import { useShallow } from "zustand/react/shallow";

import { CardDialog } from "@/components/card-dialog/CardDialog";
import { CardDialogButton } from "@/components/card-dialog/CardDialogButton";
import { FormField } from "@/components/card-dialog/FormField";
import { StatusLine } from "@/components/card-dialog/StatusLine";
import { getFieldInputClassName } from "@/components/card-dialog/field-input.util";

import { useFetchTemplateDetails } from "../hooks/useFetchTemplateDetails";
import { useUpdateTemplateMutation } from "../hooks/useUpdateTemplateMutation";
import { useTemplateApprovalStore } from "../stores/template-approval-store";

/**
 * Rejects the template selected in the approval table with a required remark.
 */
const RejectWithRemarkDialog = () => {
  const remarkId = useId();
  const { remark, rowId, showDialog, setRemark, setShowDialog } = useTemplateApprovalStore(
    useShallow((state) => ({
      rowId: state.rowId,
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
      remark: state.remark,
      setRemark: state.setRemark,
    })),
  );

  const { data } = useFetchTemplateDetails(rowId);
  const { mutate, isPending } = useUpdateTemplateMutation();
  const templateName = data?.data?.name;

  const handleReject = () => {
    if (data?.data) {
      mutate({
        ...data.data,
        status: "Rejected",
        remark: remark,
      });
    }
  };

  return (
    <CardDialog
      isOpen={showDialog}
      onClose={() => setShowDialog(false)}
      isDismissLocked={isPending}
      isOutsideClickLocked={Boolean(remark)}
      mark={<IconTile Icon={FileXIcon} size="lg" className="size-12 rounded-lg [&>svg]:size-6" />}
      eyebrow="Reject template"
      eyebrowClassName="text-bad"
      title={
        <span className={cn(!templateName && "text-muted-foreground")}>
          {templateName || "Template"}
        </span>
      }
      footer={
        <>
          <StatusLine tone="idle">A remark is required to reject</StatusLine>
          <div className="flex shrink-0 items-center gap-2">
            <CardDialogButton onClick={() => setShowDialog(false)} disabled={isPending}>
              Cancel
            </CardDialogButton>
            <CardDialogButton
              variant="danger"
              onClick={handleReject}
              disabled={isPending || !remark}
              isBusy={isPending}
            >
              {isPending ? "Rejecting" : "Reject template"}
            </CardDialogButton>
          </div>
        </>
      }
    >
      <FormField htmlFor={remarkId} label="Remark">
        <textarea
          id={remarkId}
          data-autofocus
          rows={4}
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="Why is this template rejected?"
          className={cn(getFieldInputClassName(false), "block resize-none py-2.5 leading-5")}
        />
      </FormField>
    </CardDialog>
  );
};

export default RejectWithRemarkDialog;
