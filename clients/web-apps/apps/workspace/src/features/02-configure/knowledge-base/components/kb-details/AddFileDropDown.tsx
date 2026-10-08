import { LockedActionTooltip, useActionLock } from "@avplatform/ui/action-lock";
import { Button, buttonVariants } from "@avplatform/ui/buttons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  SimpleDDMenuItem,
} from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import {
  ChevronDownIcon,
  FileTextIcon,
  // GlobeIcon,
  TypeIcon,
} from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/react/shallow";

import { useKBFilesDialogStore } from "../../stores/kb-files-upload-dialog-store";

export default function AddFileDropDown() {
  // Adding KB files/text creates sub-resources, which is disabled in Prod.
  const { locked } = useActionLock();

  const { setShowDialog, setType } = useKBFilesDialogStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
      setType: state.setType,
    })),
  );

  // Handle create action
  const handleAddFile = () => {
    setShowDialog(true);
    setType("file");
  };

  // Register the Ctrl+Alt+N shortcut (suppressed when the environment is locked).
  useHotkeys("ctrl+alt+n", handleAddFile, { preventDefault: true, enabled: !locked });

  const addFileButton = (
    <Button
      className={cn("rounded-r-none border-r-0 flex items-center gap-1.5")}
      size={"xs"}
      onClick={handleAddFile}
      disabled={locked}
    >
      <FileTextIcon className="h-3.5 w-3.5" />
      Add File
    </Button>
  );

  return (
    <div className="flex items-center">
      {/* Left: direct action button */}
      {locked ? (
        <LockedActionTooltip>{addFileButton}</LockedActionTooltip>
      ) : (
        <Tooltip content={""} shortcut="Ctrl+Alt+N">
          {addFileButton}
        </Tooltip>
      )}

      {/* Divider */}
      <div className="w-px self-stretch bg-gray-500/80" />

      {/* Right: chevron is the DD trigger */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(buttonVariants({ size: "xs" }), "group rounded-l-none px-2")}
            disabled={locked}
          >
            <ChevronDownIcon className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-40 min-w-40" align="end">
          <SimpleDDMenuItem
            size="md"
            disabled={locked}
            onClick={() => {
              setShowDialog(true);
              setType("file");
            }}
            Icon={FileTextIcon}
            content="Add File"
          />
          <SimpleDDMenuItem
            size="md"
            disabled={locked}
            onClick={() => {
              setShowDialog(true);
              setType("text");
            }}
            Icon={TypeIcon}
            content="Add Text"
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
