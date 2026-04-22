import { Button, buttonVariants } from "@aventisia/ui/buttons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  SimpleDDMenuItem,
} from "@aventisia/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
import {
  ChevronDownIcon,
  FileTextIcon,
  // GlobeIcon,
  TypeIcon,
} from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useKBFilesDialogStore } from "../../stores/kb-files-upload-dialog-store";

export default function AddFileDropDown() {
  const { setShowDialog, setType } = useKBFilesDialogStore(
    useShallow((state) => ({
      setShowDialog: state.setShowDialog,
      setType: state.setType,
    })),
  );
  return (
    <div className="flex items-center">
      {/* Left: direct action button */}
      <Button
        className={cn("rounded-r-none border-r-0 flex items-center gap-1.5")}
        size={"xs"}
        onClick={() => {
          setShowDialog(true);
          setType("file");
        }}
      >
        <FileTextIcon className="h-3.5 w-3.5" />
        Add File
      </Button>

      {/* Divider */}
      <div className="w-px self-stretch bg-gray-500/80" />

      {/* Right: chevron is the DD trigger */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              buttonVariants({ size: "xs" }),
              "group rounded-l-none px-2",
            )}
          >
            <ChevronDownIcon className="h-3.5 w-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-40 min-w-40" align="end">
          <SimpleDDMenuItem
            size="md"
            onClick={() => {
              setShowDialog(true);
              setType("file");
            }}
            Icon={FileTextIcon}
            content="Add File"
          />
          <SimpleDDMenuItem
            size="md"
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
