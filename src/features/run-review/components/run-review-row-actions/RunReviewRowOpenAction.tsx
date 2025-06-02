import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface RunReviewRowOpenActionProps {
  rowId: string;
}

export const RunReviewRowOpenAction = ({
  rowId,
}: RunReviewRowOpenActionProps) => {
  // Get handle function to open flow
  //   const handleOpenModelAction = useOpenModel();

  // Return the component
  return (
    <SimpleDDMenuItem
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      //   onClick={() => handleOpenModelAction(rowId, "Label")}
      onClick={() => console.log("open row", rowId)}
    />
  );
};
