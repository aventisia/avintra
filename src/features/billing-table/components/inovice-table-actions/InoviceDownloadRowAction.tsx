import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/react-toolkit/ui/buttons/Button";

interface InoviceDownloadRowActionProps {
  rowId: string;
}

export const InoviceDownloadRowAction = ({
  rowId,
}: InoviceDownloadRowActionProps) => {
  // Return Delete alert dialog trigger
  return (
    <Button
      onClick={() => {
        toast.success("Download will start in seconds!" + rowId);
      }}
      size="icon5"
      variant="ghost"
    >
      <Download />
    </Button>
  );
};
