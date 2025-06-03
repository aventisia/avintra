import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

import { useOpenRunReviewRecord } from "../../hooks/useOpenRunReviewRecords";

export const RunReviewRowOpenAction = () => {
  // Get handle function to open Record
  const handleOpenRunReviewAction = useOpenRunReviewRecord();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleOpenRunReviewAction()}
    />
  );
};
