import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { UserIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useUiBuilderUsersStore } from "../../stores/ui-builder-users-store";

interface UiBuilderRowAssignUsersActionProps {
  rowId: string;
  size?: "sm" | "md";
  isDisabled: boolean;
}

export const UiBuilderRowAssignUsersAction = ({
  rowId,
  size = "md",
  isDisabled,
}: UiBuilderRowAssignUsersActionProps) => {
  const { setOpen, setProjectId } = useUiBuilderUsersStore(
    useShallow((state) => ({
      setOpen: state.setShowDialog,
      setProjectId: state.setUiBuilderProjectId,
    })),
  );

  return (
    <SimpleDDMenuItem
      size={size}
      disabled={isDisabled}
      content="Users"
      Icon={UserIcon}
      onClick={() => {
        setProjectId(rowId);
        setOpen(true);
      }}
    />
  );
};
