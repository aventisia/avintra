import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";

import { useToggleLibraryTool } from "../../hooks/useToggleLibraryTool.hook";

type ToolRowToggleEnabledActionProps = {
  toolId: string;
  isEnabled?: boolean;
};

export const ToolRowToggleEnabledAction = ({
  toolId,
  isEnabled = false,
}: ToolRowToggleEnabledActionProps) => {
  const { canToggle, isPending, toggle } = useToggleLibraryTool();

  if (!canToggle) {
    return null;
  }

  return (
    <SimpleDDMenuItem
      disabled={isPending}
      onClick={() => toggle({ id: toolId, isEnabled: !isEnabled })}
    >
      {isEnabled ? "Disable" : "Enable"}
    </SimpleDDMenuItem>
  );
};
