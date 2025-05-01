import { TrashIcon } from "@heroicons/react/24/outline";
import { DropdownMenuItem } from "@/react-toolkit/ui/dropdown-menu";
import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { useInformationExtractorTableStore } from "../../../stores/info-extractor-table-store";
import { useShallow } from "zustand/react/shallow";

interface TabsDeleteActionProps {
  idx: number;
}

export const TabsDeleteAction = ({ idx }: TabsDeleteActionProps) => {
  const { setShowDeleteTableAlertDialog, setTableToDeleteIdx } =
    useInformationExtractorTableStore(
      useShallow((state) => ({
        setShowDeleteTableAlertDialog: state.setShowDeleteTableAlertDialog,
        setTableToDeleteIdx: state.setTableToDeleteIdx,
      })),
    );

  return (
    <DropdownMenuItem
      className={cn(
        buttonVariants({ variant: "dropdownCautionItem" }),
        "group h-8",
      )}
      onClick={() => {
        setShowDeleteTableAlertDialog(true);
        setTableToDeleteIdx(idx);
      }}
    >
      <TrashIcon className="h-4 w-4 text-destructive group-focus:text-white" />
      Delete
    </DropdownMenuItem>
  );
};
