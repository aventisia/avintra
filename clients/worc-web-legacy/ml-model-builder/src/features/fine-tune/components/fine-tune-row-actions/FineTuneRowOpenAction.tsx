import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { useOpenFineTuneRecord } from "../../hooks/useOpenFineTuneRecords";

interface FineTuneRowOpenActionProps {
  fileId: string;
}

export const FineTuneRowOpenAction = ({
  fileId,
}: FineTuneRowOpenActionProps) => {
  // Get handle function to open Record
  const handleOpenFineTuneRecord = useOpenFineTuneRecord();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleOpenFineTuneRecord(fileId)}
    />
  );
};
