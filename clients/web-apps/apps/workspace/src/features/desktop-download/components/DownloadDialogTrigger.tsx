import { buttonVariants } from "@avplatform/ui/buttons";
import { IS_TAURI } from "@avplatform/ui/constants";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { DownloadIcon } from "lucide-react";

import { useDownloadDialogStore } from "@/features/desktop-download/stores/download-dialog-store";

interface DownloadDialogTriggerProps {
  triggerSize?: "icon7" | "icon8" | "icon9";
}

/**
 * Renders the header trigger for the desktop download dialog.
 * Hidden when running inside the Tauri desktop app.
 */
export const DownloadDialogTrigger: React.FC<DownloadDialogTriggerProps> = ({
  triggerSize = "icon8",
}) => {
  const toggleOpen = useDownloadDialogStore((state) => state.toggleOpen);

  if (IS_TAURI) return null;

  return (
    <Tooltip content="Download Desktop App">
      <button
        type="button"
        className={cn(buttonVariants({ variant: "ghost", size: triggerSize }), "hover:bg-white/10")}
        onClick={() => toggleOpen()}
      >
        <DownloadIcon className="h-[1.2rem] w-[1.2rem] text-white/80" />
      </button>
    </Tooltip>
  );
};
