import { ArrowUpRightIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { SimpleDDMenuItem } from "@/ui/components/dropdown-menu";
import { useDTCrudDialogStore } from "@/ui/stores";

interface DTEditRowActionStoreProps {
  rowId: string;
  size?: "sm" | "md";
  crudAction: "update" | "read";
}

export const DTRowActionStore: React.FC<DTEditRowActionStoreProps> = ({
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
      Icon={crudAction === "read" ? ArrowUpRightIcon : PencilSquareIcon}
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
