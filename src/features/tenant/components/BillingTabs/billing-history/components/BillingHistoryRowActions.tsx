import { Button } from "@aventisia/ui/buttons";
import { Download } from "lucide-react";

interface BillingRowActionsProps {
  rowId: string;
}

export const BillingHistoryRowActions = ({ rowId }: BillingRowActionsProps) => {
  return (
    <Button size={"xs"} variant={"ghost"} onClick={() => console.log(rowId)}>
      <Download className="h-4 w-4" />
    </Button>
  );
};
