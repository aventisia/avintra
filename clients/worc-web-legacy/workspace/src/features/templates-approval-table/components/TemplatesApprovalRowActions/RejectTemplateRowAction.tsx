import { buttonVariants } from "@aventisia/ui/buttons";
import { DropdownMenuItem } from "@aventisia/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
import { XIcon } from "lucide-react";
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
