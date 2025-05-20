import { Button } from "@aventisia/ui/buttons";
import { toast } from "@aventisia/ui/sonner";
import { Download } from "lucide-react";

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
