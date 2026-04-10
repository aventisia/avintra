import { Button } from "@aventisia/ui/buttons";
import { Trash2Icon } from "lucide-react";

interface KBFilesTableRowActionProps {
  rowId: string;
}

export const KBFilesTableRowAction = ({
  rowId,
}: KBFilesTableRowActionProps) => {
  console.log(rowId);
  return (
    <Button
      // onClick={handleRemoveAgent}
      variant="caution"
      size="icon7"
      // disabled={isPending && currDel === agentId}
    >
      {/* {isPending && currDel === agentId ? (
          <LoadingSpinner className="h-4 w-4" />
        ) : ( */}
      <Trash2Icon className="h-4 w-4" />
      {/* )} */}
    </Button>
  );
};
