import { buttonVariants } from "@avplatform/ui/buttons";
import { DialogTrigger } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { NodeToolbar, Position } from "@xyflow/react";
import { EllipsisIcon } from "lucide-react";

export const ReplaceFlowTrigger = (props: React.ComponentPropsWithoutRef<typeof DialogTrigger>) => {
  return (
    <NodeToolbar offset={5} position={Position.Top}>
      <DialogTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "icon6" }),
          "z-10 rounded-full opacity-80 hover:opacity-100",
          "aria-[expanded=true]:opacity-100",
        )}
        {...props}
      >
        <EllipsisIcon className="h-4 w-4 text-[--icon-color]" />
      </DialogTrigger>
    </NodeToolbar>
  );
};
