import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface UiBuilderRowOpenActionProps {
  rowId: string;
}

export const UiBuilderRowOpenAction = ({ rowId }: UiBuilderRowOpenActionProps) => {
  const handleOpenAction = () => {
    window.location.href = `${import.meta.env.VITE_STUDIO_PATH}ui-builder?id=${rowId}`;
  };

  return (
    <SimpleDDMenuItem content="Open" Icon={ArrowTopRightOnSquareIcon} onClick={handleOpenAction} />
  );
};
