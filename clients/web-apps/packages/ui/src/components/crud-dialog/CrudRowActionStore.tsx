import { ArrowUpRight, SquarePen } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { SimpleDDMenuItem } from "@/ui/components/dropdown-menu";
import { useDTCrudDialogStore } from "@/ui/stores";

interface CrudRowActionStoreProps {
  rowId: string;
  size?: "sm" | "md";
  crudAction: "update" | "read";
}

export const CrudRowActionStore: React.FC<CrudRowActionStoreProps> = ({
  rowId,
  crudAction,
  size = "md",
}) => {
  const { setCrudDialogOptions } = useDTCrudDialogStore(
    useShallow((state) => ({
      setCrudDialogOptions: state.setCrudDialogOptions,
    })),
  );

  return (
    <SimpleDDMenuItem
      size={size}
      content={crudAction === "read" ? "View" : "Edit"}
      Icon={crudAction === "read" ? ArrowUpRight : SquarePen}
      onClick={() => {
        setCrudDialogOptions({
          showDialog: true,
          rowId,
          crudAction,
        });
      }}
    />
  );
};
