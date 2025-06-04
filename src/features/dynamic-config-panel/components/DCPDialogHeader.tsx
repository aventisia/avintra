import { buttonVariants } from "@aventisia/ui/buttons";
import {
  DialogClose,
  DialogDescription,
  DialogTitle,
} from "@aventisia/ui/dialog";
import { cn } from "@aventisia/ui/lib";
import { X } from "lucide-react";
// import { InputField } from "@aventisia/ui/form";
// import { DCPForm } from "./DCPForm";
import { Input } from "@aventisia/ui";
import { useDynamicConfigPanelStore } from "../stores/dcp-store";
import { useShallow } from "zustand/react/shallow";

interface DialogDefaultHeaderProps extends React.PropsWithChildren {
  description?: string;
  className?: string;
}

const DCPDialogHeader = ({
  description,
  children,
  className,
}: DialogDefaultHeaderProps) => {
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
          <Input
            name="label"
            className="-ml-2 truncate !border-0 !border-none !shadow-none !outline-none !ring-0 focus:!border focus:!border-input focus:!bg-background focus:!shadow-sm focus:!outline-none focus:!ring-2 focus:!ring-ring"
            value={nodeLabel}
            onChange={(e) => setNodeLabel(e.target.value)}
          />
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
