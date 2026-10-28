import { Avatar, AvatarFallback, AvatarImage } from "@avplatform/ui/avatar";

import { Participant } from "../../constants/types";

interface Props {
  user: Participant;
  onHoverStart: (user: Participant) => void;
  onHoverEnd: () => void;
  onCancel: () => void;
}

export const ParticipantAvatar: React.FC<Props> = ({
  user,
  onHoverStart,
  onHoverEnd,
  onCancel,
}) => (
  <div onMouseEnter={() => onHoverStart(user)} onMouseLeave={onHoverEnd}>
    <Avatar
      className="-ml-4 h-8 w-8 border-2 border-surface !bg-sunken text-xs font-bold capitalize tracking-wider text-ink-2 hover:z-10 hover:border-line-strong"
      onMouseEnter={onCancel}
    >
      <AvatarImage src={user.avatarSrc || ""} alt={user.initials} />
      <AvatarFallback className="bg-sunken text-xs font-bold capitalize text-ink-2">
        {user.initials}
      </AvatarFallback>
    </Avatar>
  </div>
);
