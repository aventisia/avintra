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
  const { canToggle, toggle } = useToggleLibraryTool();

  if (!canToggle) {
    return null;
  }

  return (
    <SimpleDDMenuItem onClick={() => toggle({ id: toolId, isEnabled: !isEnabled })}>
      {isEnabled ? "Deactivate" : "Activate"}
    </SimpleDDMenuItem>
  );
};
