import { Avatar, AvatarFallback } from "@avplatform/ui/avatar";
import { PlusIcon } from "@phosphor-icons/react";
import * as Tooltip from "@radix-ui/react-tooltip";

interface Props {
  onClick: () => void;
}

export const ShareAccessButton: React.FC<Props> = ({ onClick }) => (
  <Tooltip.Root delayDuration={0}>
    <Tooltip.Trigger asChild>
      <Avatar
        onClick={onClick}
        className="-ml-4 h-8 w-8 cursor-pointer border-2 border-surface !bg-sunken text-xs font-bold capitalize tracking-wider text-ink-2 hover:z-10 hover:border-line-strong"
      >
        <AvatarFallback className="bg-sunken text-xs font-bold capitalize text-ink-2">
          <PlusIcon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content
        side="bottom"
        sideOffset={4}
        className="z-50 rounded-md bg-ink px-3 py-1.5 text-xs text-bg shadow-pop"
      >
        Share access
        <Tooltip.Arrow className="fill-ink" />
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
);
