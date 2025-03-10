import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { toast } from "sonner";

interface QueueRowRetryActionProps {
  rowId: string;
}

export const QueueRowRetryAction = ({ rowId }: QueueRowRetryActionProps) => {
  // Return retry alert dialog trigger
  return (
    <SimpleDDMenuItem
      content="Retry"
      lucidIconName="RotateCw"
      className="fonr stroke-2"
      onClick={() => toast.success("Retrying " + rowId)}
    />
  );
};
