import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import * as Tooltip from "@radix-ui/react-tooltip";
import { PlusIcon } from "lucide-react";

interface Props {
  onClick: () => void;
}

export const ShareAccessButton: React.FC<Props> = ({ onClick }) => (
  <Tooltip.Root delayDuration={0}>
    <Tooltip.Trigger asChild>
      <Avatar
        onClick={onClick}
        className="-ml-4 h-8 w-8 cursor-pointer border-[2.2px] border-primary !bg-[#aba7e7] text-xs font-bold capitalize tracking-wider text-secondary hover:z-10 hover:border-slate-200"
      >
        <AvatarFallback className="bg-[#aba7e7] text-xs font-bold capitalize text-secondary">
          <PlusIcon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content
        side="bottom"
        sideOffset={4}
        className="z-50 rounded-md border border-secondary bg-secondary px-3 py-1.5 text-xs text-white shadow-md"
      >
        Share Access
        <Tooltip.Arrow className="fill-secondary" />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
);
