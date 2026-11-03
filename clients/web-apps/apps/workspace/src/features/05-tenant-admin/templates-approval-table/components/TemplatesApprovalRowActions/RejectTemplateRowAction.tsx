import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuItem } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { XIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { useTemplateApprovalStore } from "../../stores/template-approval-store";

const RejectTemplateRowAction = ({ rowId }: { rowId: string }) => {
  const { setShowDialog, setRowId } = useTemplateApprovalStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setRowId: state.setRowId,
      setShowDialog: state.setShowDialog,
    })),
  );

  return (
    <DropdownMenuItem
      className={cn(buttonVariants({ variant: "dropdownCautionItem" }), "h-8")}
      onClick={() => {
        setRowId(rowId);
        setShowDialog(true);
      }}
    >
      <XIcon className={"h-4 w-4"} />
      Reject
    </DropdownMenuItem>
  );
};

export default RejectTemplateRowAction;
