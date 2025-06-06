import { buttonVariants } from "@aventisia/ui/buttons";
import {
  DialogClose,
  DialogDescription,
  DialogTitle,
} from "@aventisia/ui/dialog";
import { cn } from "@aventisia/ui/lib";
import { PencilIcon, X } from "lucide-react";
import { Input } from "@aventisia/ui";
import { useDynamicConfigPanelStore } from "../stores/dcp-store";
import { useShallow } from "zustand/react/shallow";
import { useState } from "react";

interface DialogDefaultHeaderProps extends React.PropsWithChildren {
  description?: string;
  className?: string;
}

const DCPDialogHeader = ({
  description,
  children,
  className,
}: DialogDefaultHeaderProps) => {
  const [editing, setEditing] = useState(false);

  // Get node unique name state (required to get config panel data)
  const { nodeLabel = "Dynamic Config Panel", setNodeLabel } =
    useDynamicConfigPanelStore(
      useShallow((state) => ({
        nodeLabel: state.nodeLabel,
        setNodeLabel: state.setNodeLabel,
      })),
    );

  return (
    <div
      className={cn(
        "relative flex items-center justify-between border-b p-3.5 text-lg tracking-wide",
        className,
      )}
    >
      {/* Left side - Dialog Heading and description */}
      <div className="ml-2 flex flex-col">
        <DialogTitle className="flex items-center font-semibold text-foreground">
          {editing ? (
            <Input
              name="label"
              className="w-[25rem] !max-w-[25rem] truncate !border-0 !border-none !p-0 !text-base !font-semibold !shadow-none !outline-none !ring-0"
              value={nodeLabel}
              autoFocus
              onChange={(e) => setNodeLabel(e.target.value)}
              onBlur={() => setEditing(false)}
            />
          ) : (
            <div
              onClick={() => setEditing(true)}
              className="flex h-10 items-center gap-2"
            >
              <span className="max-w-[25rem] truncate">{nodeLabel}</span>
              <PencilIcon className="h-3 w-3 text-muted-foreground" />
            </div>
          )}
        </DialogTitle>
        <DialogDescription className="text-sm tracking-normal text-muted-foreground">
          {description}
        </DialogDescription>
      </div>
      {/* Right side - Dialog action buttons */}
      <div className="flex items-center">
        {/* Extras */}
        {children}
        {/* Close Dialog */}
        <DialogClose
          className={buttonVariants({ variant: "ghost", size: "icon8" })}
        >
          <X className="h-5 w-5 text-[--icon-color]" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </div>
    </div>
  );
};

export default DCPDialogHeader;
