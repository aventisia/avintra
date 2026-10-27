import { LoadingSpinner, Textarea } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogContent, DialogDefaultHeader, DialogFooter } from "@avplatform/ui/dialog";
import { Label } from "@avplatform/ui/label";
import { useShallow } from "zustand/react/shallow";

import { useFetchTemplateDetails } from "../hooks/useFetchTemplateDetails";
import { useUpdateTemplateMutation } from "../hooks/useUpdateTemplateMutation";
import { useTemplateApprovalStore } from "../stores/template-approval-store";

/**
 * Dialog component for rejecting a template with an remark.
 *
 * This dialog is triggered from the Templates Approval table and allows
 * an admin to enter a remark explaining the reason for rejection.
 */
const RejectWithRemarkDialog = () => {
  // Extract state and actions from the approval store
  const { remark, rowId, showDialog, setRemark, setShowDialog } = useTemplateApprovalStore(
    useShallow((state) => ({
      rowId: state.rowId,
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
      remark: state.remark,
      setRemark: state.setRemark,
    })),
  );

  // Fetch detailed information for the selected template
  const { data } = useFetchTemplateDetails(rowId);

  // Mutation hook to update the template's approval status
  const { mutate, isPending } = useUpdateTemplateMutation();

  // Handle rejection action with remark
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
    <Dialog open={showDialog} onOpenChange={() => setShowDialog(!showDialog)}>
      <DialogContent>
        <DialogDefaultHeader heading="Reject Template" />

        {/* Remarks input section */}
        <div className="space-y-2 p-3">
          <Label htmlFor="remarks" className="ml-1 flex items-center gap-0.5">
            <span>Remarks</span>
            <span className="text-bad">*</span>
          </Label>

          <Textarea
            id="remarks"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={4}
          />
        </div>

        {/* Footer with Reject button */}
        <DialogFooter className="flex gap-2 p-3 pt-0">
          <Button onClick={handleReject} disabled={isPending || !remark} variant="destructive">
            {isPending && <LoadingSpinner className="mr-2 h-4 w-4" />}
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RejectWithRemarkDialog;
