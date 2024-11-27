import { cn } from "@/react-toolkit/lib/utils";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import {
  Popover,
  PopoverContent,
  PopoverDefaultHeader,
  PopoverTrigger,
} from "@/react-toolkit/ui/popover";
import { StopPropagationWrapper } from "@/react-toolkit/ui/StopPropagationWrapper";
import { NodeDataType } from "@/types/node-data-type";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

interface OpenNodeConfigProps {
  data: NodeDataType;
}


export const OpenNodeConfig = (
  {data}: OpenNodeConfigProps,
) => {
  return (
    <StopPropagationWrapper className="flex">
      <Popover>
        <PopoverTrigger
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon6" }),
            "group z-10",
            "aria-[expanded=true]:bg-accent",
            "nodrag nopan",
          )}
        >
          <Cog6ToothIcon
            className={cn(
              "h-3.5 w-3.5 stroke-[2.5] text-[--icon-color] opacity-50",
            )}
          />
        </PopoverTrigger>
        {/* Popover content */}
        <PopoverContent
          collisionPadding={10}
          align="start"
          side="right"
          variant={"responsive"}
        >
          <PopoverDefaultHeader heading={data.label} />
        </PopoverContent>
      </Popover>
    </StopPropagationWrapper>
  );
};
