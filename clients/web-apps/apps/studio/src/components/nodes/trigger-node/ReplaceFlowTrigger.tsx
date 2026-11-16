import { buttonVariants } from "@avplatform/ui/buttons";
import { DialogTrigger } from "@avplatform/ui/dialog";
import { cn } from "@avplatform/ui/lib";
import { DotsThreeIcon } from "@phosphor-icons/react";
import { NodeToolbar, Position } from "@xyflow/react";

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
        <DotsThreeIcon className="h-4 w-4 text-[--icon-color]" />
      </DialogTrigger>
    </NodeToolbar>
  );
};
