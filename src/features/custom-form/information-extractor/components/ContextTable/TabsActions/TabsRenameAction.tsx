import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { DropdownMenuItem } from "@/react-toolkit/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { useInformationExtractorTableStore } from "../../../stores/info-extractor-table-store";
import { useShallow } from "zustand/react/shallow";

interface TabsRenameActionProps {
  idx: number;
}

export const TabsRenameAction = ({ idx }: TabsRenameActionProps) => {
  const { setTableToEditNameIndex } = useInformationExtractorTableStore(
    useShallow((state) => ({
      setTableToEditNameIndex: state.setTableToEditNameIndex,
    })),
  );
  return (
    <DropdownMenuItem
      className={cn(buttonVariants({ variant: "dropdownItem" }), "group h-8")}
      onClick={() => {
        setTableToEditNameIndex(idx);
      }}
    >
      <PencilSquareIcon className="h-4 w-4" />
      Rename
    </DropdownMenuItem>
  );
};
