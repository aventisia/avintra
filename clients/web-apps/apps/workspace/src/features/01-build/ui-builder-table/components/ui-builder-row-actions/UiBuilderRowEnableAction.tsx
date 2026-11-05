import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { CheckCircle } from "lucide-react";

import { UiBuilderTableDto } from "../../dtos/ui-builder-table-dto";
import { useUpdateUiBuilderMutation } from "../../hooks/useUpdateUiBuilderMutation";

interface UiBuilderRowEnableActionProps {
  project: UiBuilderTableDto;
  size?: "sm" | "md";
}

export const UiBuilderRowEnableAction = ({
  project,
  size = "md",
}: UiBuilderRowEnableActionProps) => {
  const { mutate } = useUpdateUiBuilderMutation();

  return (
    <SimpleDDMenuItem
      size={size}
      content="Enable"
      Icon={CheckCircle}
      onClick={() => mutate({ ...project, isDisabled: false })}
    />
  );
};
