import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { Download } from "lucide-react";

interface BillingRowActionsProps {
  rowId: string;
}

export const BillingHistoryRowActions = ({ rowId }: BillingRowActionsProps) => {
  return (
    <Tooltip content="Will be available soon">
      {/* <Button size={"xs"} variant={"ghost"} onClick={() => console.log(rowId)}> */}
      <div
        className={cn(buttonVariants({ variant: "ghost", size: "xs" }))}
        onClick={() => console.log(rowId)}
      >
        <Download className="h-4 w-4" />
      </div>
      {/* </Button> */}
    </Tooltip>
  );
};
