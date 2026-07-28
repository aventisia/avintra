import * as Tooltip from "@radix-ui/react-tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@avplatform/ui/avatar";
import { Participant } from "../../constants/types";

interface FacePileTooltipProps {
  open: boolean;
  data: Participant | null;
  onEnter: () => void;
  onLeave: () => void;
}

export const FacePileTooltip: React.FC<FacePileTooltipProps> = ({
  open,
  data,
  onEnter,
  onLeave,
}) => {
  if (!data) return null;

  return (
    <Tooltip.Root open={open}>
      <Tooltip.Trigger asChild>
        <div
          style={{ position: "absolute", pointerEvents: "none", opacity: 0 }}
        />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="bottom"
          sideOffset={12}
          className="z-50 rounded-md border border-secondary bg-secondary px-3 py-2 text-xs text-white shadow-md"
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 border-[2.2px] border-primary bg-[#aba7e7] text-xs font-bold capitalize text-secondary">
              <AvatarImage src={data.avatarSrc || ""} alt={data.initials} />
              <AvatarFallback className="bg-[#aba7e7] text-xs font-bold capitalize text-secondary">
                {data.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium text-white">{data.userFullName}</h3>
              <span className="text-2xs text-muted-foreground">
                {data.userName}
              </span>
              {data.type && <div className="mt-1 text-2xs">{data.type}</div>}
            </div>
          </div>
          <Tooltip.Arrow className="fill-secondary" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};
